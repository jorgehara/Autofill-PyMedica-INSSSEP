"""
Procesador unificado de datos INSSSEP.
Maneja múltiples formatos de entrada y aplica reglas de negocio.
"""

import re
from collections import defaultdict
from dataclasses import dataclass
from typing import List, Dict, Optional, Tuple
from enum import Enum


class FormatoEntrada(Enum):
    """Tipos de formato de entrada soportados."""
    RECETAS_INSSSEP = "recetas_insssep"
    LISTA_FORMATEADA = "lista_formateada"
    DESCONOCIDO = "desconocido"


class EstadoValidacion(Enum):
    """Estado de validación de un afiliado."""
    VALIDO = "valido"
    ADVERTENCIA = "advertencia"  # 3 consultas
    EXCEPCION = "excepcion"      # 4 consultas
    ERROR = "error"              # Más de 4 consultas


@dataclass
class Afiliado:
    """Representa un afiliado del sistema."""
    codigo: str
    dni: str
    nombre: str
    tipo: str  # Titular o Beneficiario
    credencial: str
    cuil: Optional[str] = None
    consultas: int = 0
    recetas: int = 0
    estado: EstadoValidacion = EstadoValidacion.VALIDO

    def a_formato_extension(self) -> str:
        """Convierte a formato para la extensión Chrome."""
        return f"{self.codigo},{self.dni},{self.nombre},{self.credencial}"

    def validar_consultas(self) -> Tuple[EstadoValidacion, str]:
        """
        Valida la cantidad de consultas según las reglas de negocio.

        Returns:
            Tuple[EstadoValidacion, str]: Estado y mensaje
        """
        if self.consultas <= 2:
            return EstadoValidacion.VALIDO, "OK"
        elif self.consultas == 3:
            return EstadoValidacion.ADVERTENCIA, "Límite estándar alcanzado (3 consultas)"
        elif self.consultas == 4:
            return EstadoValidacion.EXCEPCION, "Excepción aplicada (4 consultas)"
        else:
            return EstadoValidacion.ERROR, f"EXCEDIDO: {self.consultas} consultas (máx 4)"


class DetectorFormato:
    """Detecta automáticamente el formato del archivo de entrada."""

    @staticmethod
    def detectar(texto: str) -> FormatoEntrada:
        """
        Detecta el formato del texto de entrada.

        Args:
            texto: Texto a analizar

        Returns:
            FormatoEntrada detectado
        """
        # Buscar patrón de recetas INSSSEP
        patron_recetas = r"INSSSEP AMB.*?Afiliado:.*?D\.N\.I\.:.*?Credencial:"
        if re.search(patron_recetas, texto, re.DOTALL):
            return FormatoEntrada.RECETAS_INSSSEP

        # Buscar patrón de lista formateada (código + DNI + nombre + tipo + credencial)
        patron_lista = r"[A-Z]\d{2,3}\s+\d{7,8}\s+[A-ZÁÉÍÓÚÑ\s]+\s+(Titular|Beneficiario)\s+\d+"
        if re.search(patron_lista, texto):
            return FormatoEntrada.LISTA_FORMATEADA

        return FormatoEntrada.DESCONOCIDO


class ProcesadorRecetasINSSSEP:
    """Procesa archivos de recetas INSSSEP."""

    # Patrón robusto que maneja variaciones en el formato
    PATRON_RECETA = re.compile(
        r"INSSSEP AMB(?:\s*\n(?:Dispensada|Consultada))?\s*\n"
        r"Afiliado:\s*([^\n]+)\s*\n"
        r"D\.N\.I\.:\s*(\d+)\s+Credencial:\s*(\d+)",
        re.MULTILINE
    )
    
    # Patrón alternativo para formatos más simples
    PATRON_ALTERNATIVO = re.compile(
        r"INSSSEP AMB[^\n]*\n(?:Dispensada\n)?Afiliado:\s*(.*?)\nD\.N\.I\.:\s*(\d+)\s*Credencial:\s*(\d+)",
        re.MULTILINE
    )

    @staticmethod
    def procesar(texto: str, codigo_diagnostico: str = "B349") -> Dict[str, Afiliado]:
        """
        Procesa texto con formato de recetas INSSSEP.
        Extrae todos los afiliados y cuenta cuántas recetas tiene cada uno.

        Args:
            texto: Texto de entrada con recetas INSSSEP
            codigo_diagnostico: Código por defecto a usar

        Returns:
            Dict[DNI, Afiliado]
        """
        afiliados = {}
        
        # Intentar con el patrón principal
        coincidencias = ProcesadorRecetasINSSSEP.PATRON_RECETA.findall(texto)
        
        # Si no encuentra nada, intentar con el patrón alternativo
        if not coincidencias:
            coincidencias = ProcesadorRecetasINSSSEP.PATRON_ALTERNATIVO.findall(texto)

        # Conteo de recetas por DNI
        for nombre, dni, credencial in coincidencias:
            nombre = nombre.strip().upper()
            dni = dni.strip()
            credencial = credencial.strip()

            if dni in afiliados:
                # Si ya existe, incrementar contador de recetas
                afiliados[dni].recetas += 1
            else:
                # Crear nuevo afiliado con 1 receta
                afiliados[dni] = Afiliado(
                    codigo=codigo_diagnostico,
                    dni=dni,
                    nombre=nombre,
                    tipo="Titular",
                    credencial=credencial,
                    cuil=None,  # Se generará después si es necesario
                    consultas=0,  # Las recetas no son consultas
                    recetas=1
                )

        return afiliados


class ProcesadorListaFormateada:
    """Procesa listas ya formateadas."""

    # Patrón para Titular/Beneficiario estándar
    PATRON_LINEA = re.compile(
        r"^([A-Z]\d{2,3})\s+"           # Código
        r"(\d{7,8})\s+"                  # DNI
        r"([A-ZÁÉÍÓÚÑ\s,.-]+?)\s+"      # Nombre
        r"(Titular|Beneficiario)\s+"     # Tipo
        r"(\d+)"                         # Credencial principal
        r"(?:\s+(\d+))?",                # CUIL (opcional)
        re.IGNORECASE
    )

    # Patrón para Familiar (formato: CODIGO DNI_TITULAR NOMBRE_FAMILIAR [vacío] DNI_FAMILIAR CUIL)
    PATRON_FAMILIAR = re.compile(
        r"^([A-Z]\d{2,3})\s+"           # Código
        r"(\d{7,8})\s+"                  # DNI del titular
        r"([A-ZÁÉÍÓÚÑ\s,.-]+?)\s+"      # Nombre del familiar
        r"\s+"                           # Espacios (campo tipo vacío)
        r"(\d{7,8})"                     # DNI del familiar (credencial)
        r"(?:\s+(\d+))?",                # CUIL del familiar (opcional)
        re.IGNORECASE
    )

    @staticmethod
    def procesar(texto: str) -> Dict[str, Afiliado]:
        """
        Procesa texto con formato de lista formateada.
        Soporta tanto titulares/beneficiarios como familiares.

        Args:
            texto: Texto de entrada

        Returns:
            Dict[DNI, Afiliado]
        """
        afiliados = {}
        lineas = texto.strip().split('\n')

        for linea in lineas:
            linea_limpia = linea.strip()
            if not linea_limpia:
                continue

            # Intentar primero con el patrón estándar (Titular/Beneficiario)
            match = ProcesadorListaFormateada.PATRON_LINEA.match(linea_limpia)

            if match:
                codigo, dni, nombre, tipo, credencial, cuil = match.groups()
                nombre = nombre.strip().upper()
                dni = dni.strip()
                credencial = credencial.strip()
                cuil = cuil.strip() if cuil else None

                if dni in afiliados:
                    afiliados[dni].consultas += 1
                else:
                    afiliados[dni] = Afiliado(
                        codigo=codigo,
                        dni=dni,
                        nombre=nombre,
                        tipo=tipo,
                        credencial=credencial,
                        cuil=cuil,
                        consultas=1
                    )
            else:
                # Intentar con el patrón de familiar
                match_familiar = ProcesadorListaFormateada.PATRON_FAMILIAR.match(linea_limpia)

                if match_familiar:
                    codigo, dni_titular, nombre, dni_familiar, cuil = match_familiar.groups()
                    nombre = nombre.strip().upper()
                    dni_familiar = dni_familiar.strip()
                    cuil = cuil.strip() if cuil else None

                    # El DNI clave es el del familiar
                    if dni_familiar in afiliados:
                        afiliados[dni_familiar].consultas += 1
                    else:
                        afiliados[dni_familiar] = Afiliado(
                            codigo=codigo,
                            dni=dni_familiar,
                            nombre=nombre,
                            tipo="Familiar",
                            credencial=dni_familiar,  # Para familiares, credencial = su propio DNI
                            cuil=cuil,
                            consultas=1
                        )

        return afiliados


class ProcesadorUnificado:
    """Procesador principal que unifica todos los formatos."""

    def __init__(self):
        self.afiliados: Dict[str, Afiliado] = {}
        self.formato_detectado: Optional[FormatoEntrada] = None
        self.tiene_afiliados: bool = False
        self.tiene_recetas: bool = False

    def procesar_archivo(
        self,
        texto: str,
        codigo_diagnostico: str = "B349",
        forzar_formato: Optional[FormatoEntrada] = None
    ) -> Dict:
        """
        Procesa un archivo detectando automáticamente su formato.

        Args:
            texto: Contenido del archivo
            codigo_diagnostico: Código diagnóstico por defecto
            forzar_formato: Fuerza un formato específico (opcional)

        Returns:
            Dict con resultados del procesamiento
        """
        # Detectar formato
        if forzar_formato:
            self.formato_detectado = forzar_formato
        else:
            self.formato_detectado = DetectorFormato.detectar(texto)

        # Procesar según formato
        if self.formato_detectado == FormatoEntrada.RECETAS_INSSSEP:
            self.afiliados = ProcesadorRecetasINSSSEP.procesar(texto, codigo_diagnostico)
        elif self.formato_detectado == FormatoEntrada.LISTA_FORMATEADA:
            self.afiliados = ProcesadorListaFormateada.procesar(texto)
        else:
            return {
                'success': False,
                'error': 'Formato de archivo no reconocido'
            }

        # Validar consultas
        self._validar_consultas()

        # Generar estadísticas
        estadisticas = self._generar_estadisticas()

        return {
            'success': True,
            'formato': self.formato_detectado.value,
            'afiliados': self.afiliados,
            'estadisticas': estadisticas
        }

    def procesar_ambos_archivos(
        self,
        texto_afiliados: str,
        texto_recetas: str,
        codigo_diagnostico: str = "B349"
    ) -> Dict:
        """
        Procesa ambos archivos: lista de afiliados y archivo de recetas.
        Cruza la información entre ambos.

        Args:
            texto_afiliados: Contenido del archivo de afiliados (lista formateada)
            texto_recetas: Contenido del archivo de recetas INSSSEP
            codigo_diagnostico: Código diagnóstico por defecto

        Returns:
            Dict con resultados del procesamiento
        """
        # Procesar afiliados (lista formateada) - ESTOS SON LA BASE
        afiliados_base = ProcesadorListaFormateada.procesar(texto_afiliados)
        
        if not afiliados_base:
            return {
                'success': False,
                'error': 'No se pudieron procesar los afiliados de la lista formateada'
            }

        # Procesar recetas - EXTRAER DATOS DE RECETAS
        afiliados_recetas = ProcesadorRecetasINSSSEP.procesar(texto_recetas, codigo_diagnostico)
        
        if not afiliados_recetas:
            return {
                'success': False,
                'error': 'No se pudieron procesar las recetas INSSSEP'
            }

        # CRUCE: Combinar consultas de la lista base con recetas del archivo INSSSEP
        self.afiliados = {}
        
        # 1. Partir de todos los afiliados de la lista base
        for dni, afiliado_base in afiliados_base.items():
            self.afiliados[dni] = Afiliado(
                codigo=afiliado_base.codigo,
                dni=afiliado_base.dni,
                nombre=afiliado_base.nombre,
                tipo=afiliado_base.tipo,
                credencial=afiliado_base.credencial,
                cuil=afiliado_base.cuil,
                consultas=afiliado_base.consultas,  # Consultas de la lista
                recetas=0  # Se llenará si hay recetas
            )
            
            # Si este afiliado también tiene recetas, agregarlas
            if dni in afiliados_recetas:
                self.afiliados[dni].recetas = afiliados_recetas[dni].recetas
        
        # 2. Agregar afiliados que SOLO están en recetas (ej: familiares)
        for dni, afiliado_receta in afiliados_recetas.items():
            if dni not in self.afiliados:
                self.afiliados[dni] = Afiliado(
                    codigo=codigo_diagnostico,
                    dni=afiliado_receta.dni,
                    nombre=afiliado_receta.nombre,
                    tipo=afiliado_receta.tipo,
                    credencial=afiliado_receta.credencial,
                    cuil=None,
                    consultas=0,
                    recetas=afiliado_receta.recetas
                )

        self.tiene_afiliados = True
        self.tiene_recetas = True

        # Validar consultas
        self._validar_consultas()

        # Generar estadísticas
        estadisticas = self._generar_estadisticas()

        return {
            'success': True,
            'formato': 'cruce_afiliados_recetas',
            'afiliados': self.afiliados,
            'estadisticas': estadisticas
        }

    def _validar_consultas(self):
        """Valida las consultas de todos los afiliados."""
        for afiliado in self.afiliados.values():
            estado, mensaje = afiliado.validar_consultas()
            afiliado.estado = estado

    def _generar_estadisticas(self) -> Dict:
        """Genera estadísticas del procesamiento."""
        total_afiliados = len(self.afiliados)
        total_consultas = sum(a.consultas for a in self.afiliados.values())
        total_recetas = sum(a.recetas for a in self.afiliados.values())

        por_estado = defaultdict(int)
        for afiliado in self.afiliados.values():
            por_estado[afiliado.estado.value] += 1

        return {
            'total_afiliados': total_afiliados,
            'total_consultas': total_consultas,
            'total_recetas': total_recetas,
            'validos': por_estado.get('valido', 0),
            'advertencias': por_estado.get('advertencia', 0),
            'excepciones': por_estado.get('excepcion', 0),
            'errores': por_estado.get('error', 0)
        }

    def ordenar_por_frecuencia(self) -> List[Afiliado]:
        """Ordena afiliados por frecuencia de consultas/recetas."""
        return sorted(
            self.afiliados.values(),
            key=lambda a: (a.consultas + a.recetas),
            reverse=True
        )

    def obtener_por_estado(self, estado: EstadoValidacion) -> List[Afiliado]:
        """Obtiene afiliados filtrados por estado."""
        return [
            a for a in self.afiliados.values()
            if a.estado == estado
        ]

    def exportar_para_extension(self) -> str:
        """
        Exporta datos en formato para la extensión Chrome.
        Duplica líneas según total de consultas (consultas + recetas convertidas).

        Returns:
            String con formato CSV (codigo,dni,nombre,credencial)
        """
        lineas = []

        for afiliado in self.ordenar_por_frecuencia():
            # Convertir recetas a consultas: cada 3 recetas = 1 consulta
            consultas_de_recetas = (afiliado.recetas + 2) // 3 if afiliado.recetas > 0 else 0

            # Total de consultas
            total_consultas = afiliado.consultas + consultas_de_recetas

            # Si no tiene consultas, generar al menos 1 línea
            if total_consultas == 0:
                total_consultas = 1

            # Duplicar la línea según el total de consultas
            for _ in range(total_consultas):
                lineas.append(afiliado.a_formato_extension())

        return '\n'.join(lineas)

    def exportar_detallado(self) -> str:
        """
        Exporta reporte detallado con todas las columnas.
        Muestra información completa de cada afiliado incluyendo líneas que generará.

        Returns:
            String con formato tabla
        """
        lineas = []
        lineas.append("=" * 100)
        lineas.append("REPORTE DETALLADO DE AFILIADOS")
        lineas.append("=" * 100)
        lineas.append("")

        total_lineas_archivo = 0

        for i, afiliado in enumerate(self.ordenar_por_frecuencia(), 1):
            estado, mensaje = afiliado.validar_consultas()

            # Calcular líneas que generará este afiliado
            consultas_de_recetas = (afiliado.recetas + 2) // 3 if afiliado.recetas > 0 else 0
            total_consultas = afiliado.consultas + consultas_de_recetas
            if total_consultas == 0:
                total_consultas = 1

            total_lineas_archivo += total_consultas

            lineas.append(f"{i}. {afiliado.nombre}")
            lineas.append(f"   DNI: {afiliado.dni}")
            lineas.append(f"   Credencial: {afiliado.credencial}")
            lineas.append(f"   Código: {afiliado.codigo}")
            lineas.append(f"   Tipo: {afiliado.tipo}")
            lineas.append(f"   Consultas: {afiliado.consultas}")
            lineas.append(f"   Recetas: {afiliado.recetas}")

            if afiliado.recetas > 0:
                lineas.append(f"   Recetas convertidas: {consultas_de_recetas} consultas")

            lineas.append(f"   Total consultas: {total_consultas}")
            lineas.append(f"   Líneas en archivo: {total_consultas}")
            lineas.append(f"   Estado: {estado.value.upper()} - {mensaje}")

            if afiliado.cuil:
                lineas.append(f"   CUIL: {afiliado.cuil}")

            lineas.append("-" * 100)

        # Agregar resumen al final
        lineas.append("")
        lineas.append("=" * 100)
        lineas.append("RESUMEN")
        lineas.append("=" * 100)
        lineas.append(f"Total de afiliados únicos: {len(self.afiliados)}")
        lineas.append(f"Total de líneas en archivo CSV: {total_lineas_archivo}")
        lineas.append("=" * 100)

        return '\n'.join(lineas)

    def exportar_formato_final(self) -> str:
        """
        Exporta en formato CSV duplicando líneas según total de consultas.
        Formato: CODIGO,DNI,NOMBRE,CREDENCIAL

        Conversión de recetas a consultas:
        - Cada 3 recetas = 1 consulta
        - Fórmula: (recetas + 2) // 3 para redondear hacia arriba

        Ejemplos:
        - 1-3 recetas = 1 consulta
        - 4-6 recetas = 2 consultas
        - 7-9 recetas = 3 consultas

        Total de líneas = consultas directas + consultas convertidas de recetas

        Si un afiliado tiene:
        - 3 consultas + 0 recetas = 3 líneas
        - 0 consultas + 4 recetas = 2 líneas (4 recetas = 2 consultas)
        - 2 consultas + 3 recetas = 3 líneas (2 + 1)
        - Si no tiene ninguna, genera 1 línea por defecto

        Returns:
            String en formato CSV con líneas duplicadas por total de consultas
        """
        lineas = []

        for afiliado in self.ordenar_por_frecuencia():
            codigo = afiliado.codigo
            dni = afiliado.dni
            nombre = afiliado.nombre
            credencial = afiliado.credencial

            # Formato CSV: CODIGO,DNI,NOMBRE,CREDENCIAL
            linea = f"{codigo},{dni},{nombre},{credencial}"

            # Convertir recetas a consultas: cada 3 recetas = 1 consulta
            # Fórmula: (recetas + 2) // 3 → redondea hacia arriba
            consultas_de_recetas = (afiliado.recetas + 2) // 3 if afiliado.recetas > 0 else 0

            # Total de consultas = consultas directas + consultas convertidas de recetas
            total_consultas = afiliado.consultas + consultas_de_recetas

            # Si no tiene consultas, generar al menos 1 línea
            if total_consultas == 0:
                total_consultas = 1

            # Duplicar la línea según el total de consultas
            for _ in range(total_consultas):
                lineas.append(linea)

        return '\n'.join(lineas)


# Función auxiliar para uso rápido
def procesar_archivo_rapido(
    ruta_archivo: str,
    codigo_diagnostico: str = "B349"
) -> Dict:
    """
    Función de conveniencia para procesar un archivo rápidamente.

    Args:
        ruta_archivo: Ruta al archivo
        codigo_diagnostico: Código por defecto

    Returns:
        Dict con resultados
    """
    with open(ruta_archivo, 'r', encoding='utf-8') as f:
        texto = f.read()

    procesador = ProcesadorUnificado()
    return procesador.procesar_archivo(texto, codigo_diagnostico)


if __name__ == "__main__":
    # Ejemplo de uso
    import sys

    if len(sys.argv) > 1:
        resultado = procesar_archivo_rapido(sys.argv[1])

        if resultado['success']:
            print(f"Formato detectado: {resultado['formato']}")
            print(f"\nEstadísticas:")
            for key, value in resultado['estadisticas'].items():
                print(f"  {key}: {value}")
        else:
            print(f"Error: {resultado['error']}")

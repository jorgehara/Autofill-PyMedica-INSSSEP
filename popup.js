document.addEventListener('DOMContentLoaded', function() {
    console.log('Popup DOM cargado INSSSEP');
    // Lógica para el botón 'Cargar campos'
    const cargarBtn = document.getElementById('cargarCampos');
    if (cargarBtn) {
        cargarBtn.addEventListener('click', function() {
            const datosRaw = document.getElementById('datos').value.trim();
            // Separar por tabulaciones o espacios múltiples
            const partes = datosRaw.split(/\s+/);
            // Ejemplo: M624 22236114 SOSA CRISTINA CEFERINA Titular 22236114 27222361147
            if (partes.length >= 4) {
                document.getElementById('codigo').value = partes[0] || '';
                document.getElementById('dni').value = partes[1] || '';
                // Nombre puede tener más de una palabra, buscar hasta encontrar 'Titular' o el siguiente campo
                let nombre = '';
                let i = 2;
                while (i < partes.length && partes[i] !== 'Titular' && isNaN(Number(partes[i]))) {
                    nombre += partes[i] + ' ';
                    i++;
                }
                document.getElementById('nombre').value = nombre.trim();
                // Afiliado: buscar el siguiente número después del nombre
                let afiliado = '';
                while (i < partes.length) {
                    if (/^\d+$/.test(partes[i])) {
                        afiliado = partes[i];
                        break;
                    }
                    i++;
                }
                document.getElementById('afiliado').value = afiliado;
            }
        });
    }
});
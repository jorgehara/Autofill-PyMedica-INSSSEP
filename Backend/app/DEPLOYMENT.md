# 🚀 Guía de Despliegue en VPS - INSSSEP App

## 📋 Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Opción A: Despliegue Automático](#opción-a-despliegue-automático)
3. [Opción B: Despliegue Manual](#opción-b-despliegue-manual)
4. [Configuración SSL](#configuración-ssl)
5. [Comandos Útiles](#comandos-útiles)
6. [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Requisitos Previos

### En tu VPS
- **Sistema Operativo**: Ubuntu 20.04/22.04 o Debian 11/12
- **RAM**: Mínimo 1GB (recomendado 2GB)
- **Disco**: Mínimo 10GB libres
- **Acceso**: SSH con usuario sudo
- **IP Pública**: IP fija o dominio configurado

### En tu máquina local
- Git instalado (o cliente SFTP como FileZilla)
- Acceso SSH al VPS
- Dominio apuntando a la IP del VPS (opcional pero recomendado)

---

## ⚡ Opción A: Despliegue Automático

### Paso 1: Conectar al VPS
```bash
ssh usuario@tu-ip-vps
```

### Paso 2: Subir archivos
Opción con Git:
```bash
cd /tmp
git clone https://github.com/jorgehara/Autofill-PyMedica-INSSSEP.git
cd Autofill-PyMedica-INSSSEP/Backend/app
```

Opción con SFTP (desde tu PC):
```bash
# Comprimir la carpeta app
cd Backend
tar -czf app.tar.gz app/

# Subir al VPS
scp app.tar.gz usuario@tu-ip-vps:/tmp/

# En el VPS, descomprimir
ssh usuario@tu-ip-vps
cd /tmp
tar -xzf app.tar.gz
cd app
```

### Paso 3: Editar variables del script
```bash
nano deploy.sh
```

Modificar estas líneas:
```bash
DOMAIN="tudominio.com"     # Tu dominio o IP
EMAIL="tu@email.com"       # Tu email para certificados SSL
```

### Paso 4: Dar permisos y ejecutar
```bash
chmod +x deploy.sh
sudo bash deploy.sh
```

El script te guiará paso a paso. **Importante**: Cuando te pida editar `.env`, configura estos valores:

```bash
sudo nano /var/www/insssep/.env
```

```env
FLASK_ENV=production
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(32))')
FLASK_APP=app.py
HOST=0.0.0.0
PORT=8000
```

---

## 🔨 Opción B: Despliegue Manual

### Paso 1: Actualizar sistema e instalar dependencias
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv nginx supervisor git
```

### Paso 2: Crear estructura de directorios
```bash
sudo mkdir -p /var/www/insssep/{logs,uploads,exports,static,templates,processors}
```

### Paso 3: Copiar archivos de la aplicación
```bash
# Si usas Git
cd /var/www/insssep
sudo git clone https://github.com/jorgehara/Autofill-PyMedica-INSSSEP.git temp
sudo cp -r temp/Backend/app/* .
sudo rm -rf temp

# O copia manualmente todos los archivos desde tu PC usando SFTP
```

### Paso 4: Crear entorno virtual e instalar dependencias
```bash
cd /var/www/insssep
sudo python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Paso 5: Configurar variables de entorno
```bash
sudo cp .env.example .env
sudo nano .env
```

Configuración mínima en `.env`:
```env
FLASK_ENV=production
SECRET_KEY=genera-una-clave-aqui-con-python3-c-import-secrets-print-secrets-token-hex-32
FLASK_APP=app.py
HOST=0.0.0.0
PORT=8000
UPLOAD_FOLDER=/var/www/insssep/uploads
EXPORT_FOLDER=/var/www/insssep/exports
LOG_FILE=/var/www/insssep/logs/app.log
```

Generar SECRET_KEY segura:
```bash
python3 -c 'import secrets; print(secrets.token_hex(32))'
```

### Paso 6: Configurar permisos
```bash
sudo chown -R www-data:www-data /var/www/insssep
sudo chmod -R 755 /var/www/insssep
sudo chmod -R 777 /var/www/insssep/{uploads,exports,logs}
```

### Paso 7: Configurar Gunicorn con Supervisor
```bash
# Copiar configuración de supervisor
sudo cp supervisor.conf /etc/supervisor/conf.d/insssep.conf

# Recargar supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start insssep

# Verificar estado
sudo supervisorctl status insssep
```

### Paso 8: Configurar Nginx
```bash
# Editar configuración
sudo nano nginx.conf
```

Cambiar `tudominio.com` por tu dominio o IP.

```bash
# Copiar a sites-available
sudo cp nginx.conf /etc/nginx/sites-available/insssep

# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/insssep /etc/nginx/sites-enabled/

# Eliminar sitio default
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Paso 9: Configurar firewall
```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### Paso 10: Verificar funcionamiento
```bash
# Ver logs de la aplicación
sudo tail -f /var/log/supervisor/insssep_out.log

# Verificar que responde
curl http://localhost
```

Ahora accede desde tu navegador a: `http://tu-ip-o-dominio`

---

## 🔒 Configuración SSL (HTTPS con Let's Encrypt)

### Requisitos
- Dominio apuntando a la IP del VPS
- Puertos 80 y 443 abiertos

### Instalación
```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tudominio.com -d www.tudominio.com --email tu@email.com --agree-tos --no-eff-email

# Verificar renovación automática
sudo certbot renew --dry-run
```

### Descomentar configuración HTTPS en Nginx
```bash
sudo nano /etc/nginx/sites-available/insssep
```

Descomenta la sección del `server` que escucha en el puerto 443 y la redirección HTTPS.

```bash
# Reiniciar Nginx
sudo systemctl restart nginx
```

¡Listo! Ahora tu app está en HTTPS: `https://tudominio.com`

---

## 🛠️ Comandos Útiles

### Gestión de la aplicación
```bash
# Ver estado
sudo supervisorctl status insssep

# Reiniciar aplicación
sudo supervisorctl restart insssep

# Detener aplicación
sudo supervisorctl stop insssep

# Iniciar aplicación
sudo supervisorctl start insssep
```

### Logs
```bash
# Logs de la aplicación
sudo tail -f /var/log/supervisor/insssep_out.log
sudo tail -f /var/log/supervisor/insssep_err.log

# Logs de Gunicorn
sudo tail -f /var/www/insssep/logs/gunicorn_access.log
sudo tail -f /var/www/insssep/logs/gunicorn_error.log

# Logs de Nginx
sudo tail -f /var/log/nginx/insssep_access.log
sudo tail -f /var/log/nginx/insssep_error.log

# Logs de la app (si configuraste LOG_FILE)
sudo tail -f /var/www/insssep/logs/app.log
```

### Actualizar aplicación
```bash
# Ir al directorio
cd /var/www/insssep

# Activar entorno virtual
source venv/bin/activate

# Actualizar código (si usas Git)
sudo git pull origin main

# O subir archivos nuevos con SFTP

# Reinstalar dependencias si cambiaron
pip install -r requirements.txt

# Reiniciar aplicación
sudo supervisorctl restart insssep
```

### Nginx
```bash
# Probar configuración
sudo nginx -t

# Recargar configuración (sin downtime)
sudo systemctl reload nginx

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver estado
sudo systemctl status nginx
```

### Monitoreo
```bash
# Ver procesos de la app
ps aux | grep gunicorn

# Ver uso de recursos
htop

# Ver espacio en disco
df -h

# Ver uso de uploads/exports
du -sh /var/www/insssep/uploads/
du -sh /var/www/insssep/exports/
```

---

## 🔍 Solución de Problemas

### La aplicación no inicia
```bash
# Verificar logs
sudo tail -f /var/log/supervisor/insssep_err.log

# Verificar que Python funciona
cd /var/www/insssep
source venv/bin/activate
python app.py

# Verificar permisos
sudo chown -R www-data:www-data /var/www/insssep
```

### Nginx muestra "502 Bad Gateway"
```bash
# Verificar que Gunicorn está corriendo
sudo supervisorctl status insssep

# Reiniciar aplicación
sudo supervisorctl restart insssep

# Verificar puerto 8000
sudo netstat -tulpn | grep 8000
```

### Error de permisos al subir archivos
```bash
# Dar permisos a carpetas de uploads/exports
sudo chmod -R 777 /var/www/insssep/uploads
sudo chmod -R 777 /var/www/insssep/exports
```

### Los cambios no se reflejan
```bash
# Reiniciar aplicación
sudo supervisorctl restart insssep

# Limpiar caché del navegador o abrir ventana privada
```

### Error "Module not found"
```bash
# Reinstalar dependencias
cd /var/www/insssep
source venv/bin/activate
pip install -r requirements.txt

# Reiniciar
sudo supervisorctl restart insssep
```

### Certificado SSL no renueva
```bash
# Forzar renovación
sudo certbot renew --force-renewal

# Verificar timer de renovación automática
sudo systemctl status certbot.timer
```

---

## 📊 Mantenimiento Regular

### Limpiar archivos temporales (ejecutar mensualmente)
```bash
# Limpiar uploads antiguos (más de 30 días)
find /var/www/insssep/uploads -type f -mtime +30 -delete

# Limpiar exports antiguos (más de 30 días)
find /var/www/insssep/exports -type f -mtime +30 -delete

# Rotar logs manualmente si crecen mucho
sudo truncate -s 0 /var/log/supervisor/insssep_out.log
```

### Backup recomendado
```bash
# Hacer backup de la carpeta completa
sudo tar -czf insssep-backup-$(date +%Y%m%d).tar.gz /var/www/insssep

# Mover a ubicación segura
sudo mv insssep-backup-*.tar.gz /root/backups/
```

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs primero
2. Verifica que todos los servicios estén corriendo
3. Comprueba permisos de archivos
4. Consulta esta guía de solución de problemas

**Repositorio**: https://github.com/jorgehara/Autofill-PyMedica-INSSSEP

---

## ✅ Checklist Final

- [ ] App respondiendo en HTTP
- [ ] Nginx configurado correctamente
- [ ] Supervisor manteniendo la app corriendo
- [ ] Firewall configurado
- [ ] SSL configurado (si aplica)
- [ ] DNS apuntando al VPS
- [ ] Variables de entorno configuradas
- [ ] Permisos correctos en uploads/exports
- [ ] Logs accesibles y sin errores

¡Felicidades! Tu aplicación INSSSEP está en producción. 🎉

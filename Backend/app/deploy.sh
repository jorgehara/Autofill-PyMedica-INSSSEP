#!/bin/bash

# Script de despliegue automatizado para INSSSEP en VPS
# Ejecutar con: bash deploy.sh

set -e  # Detener en caso de error

echo "=================================="
echo "DESPLIEGUE INSSSEP APP"
echo "=================================="

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables (MODIFICAR SEGÚN TU VPS)
APP_DIR="/var/www/insssep"
APP_USER="www-data"
DOMAIN="tudominio.com"  # CAMBIAR
EMAIL="tu@email.com"    # CAMBIAR para Let's Encrypt

echo -e "${YELLOW}Paso 1: Actualizando sistema...${NC}"
sudo apt update
sudo apt upgrade -y

echo -e "${YELLOW}Paso 2: Instalando dependencias del sistema...${NC}"
sudo apt install -y python3 python3-pip python3-venv nginx supervisor git

echo -e "${YELLOW}Paso 3: Creando directorios de aplicación...${NC}"
sudo mkdir -p $APP_DIR
sudo mkdir -p $APP_DIR/logs
sudo mkdir -p $APP_DIR/uploads
sudo mkdir -p $APP_DIR/exports
sudo mkdir -p $APP_DIR/static
sudo mkdir -p $APP_DIR/templates
sudo mkdir -p $APP_DIR/processors

echo -e "${YELLOW}Paso 4: Copiando archivos de aplicación...${NC}"
# Opción A: Si usas Git
# cd $APP_DIR
# sudo git clone https://github.com/jorgehara/Autofill-PyMedica-INSSSEP.git .

# Opción B: Si subes archivos manualmente (SFTP/SCP)
echo "Copia los archivos manualmente a $APP_DIR usando SFTP"
echo "Presiona Enter cuando hayas terminado..."
read

echo -e "${YELLOW}Paso 5: Creando entorno virtual...${NC}"
cd $APP_DIR
sudo python3 -m venv venv

echo -e "${YELLOW}Paso 6: Activando entorno virtual e instalando dependencias...${NC}"
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

echo -e "${YELLOW}Paso 7: Configurando archivo .env...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${RED}IMPORTANTE: Edita el archivo .env con tus configuraciones${NC}"
    echo "sudo nano $APP_DIR/.env"
    echo "Presiona Enter cuando hayas terminado..."
    read
fi

echo -e "${YELLOW}Paso 8: Configurando permisos...${NC}"
sudo chown -R $APP_USER:$APP_USER $APP_DIR
sudo chmod -R 755 $APP_DIR
sudo chmod -R 777 $APP_DIR/uploads
sudo chmod -R 777 $APP_DIR/exports
sudo chmod -R 777 $APP_DIR/logs

echo -e "${YELLOW}Paso 9: Configurando Nginx...${NC}"
sudo cp nginx.conf /etc/nginx/sites-available/insssep
sudo sed -i "s/tudominio.com/$DOMAIN/g" /etc/nginx/sites-available/insssep
sudo ln -sf /etc/nginx/sites-available/insssep /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t

echo -e "${YELLOW}Paso 10: Configurando Supervisor...${NC}"
sudo cp supervisor.conf /etc/supervisor/conf.d/insssep.conf
sudo supervisorctl reread
sudo supervisorctl update

echo -e "${YELLOW}Paso 11: Iniciando servicios...${NC}"
sudo systemctl restart nginx
sudo supervisorctl start insssep

echo -e "${YELLOW}Paso 12: Configurando firewall...${NC}"
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw --force enable

echo -e "${GREEN}=================================="
echo "DESPLIEGUE COMPLETADO"
echo "=================================="
echo "App corriendo en: http://$DOMAIN"
echo ""
echo "PRÓXIMOS PASOS:"
echo "1. Configura DNS apuntando a la IP de tu VPS"
echo "2. Instala certificado SSL:"
echo "   sudo apt install certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL"
echo "3. Descomenta la sección HTTPS en nginx.conf"
echo "4. Reinicia Nginx: sudo systemctl restart nginx"
echo ""
echo "COMANDOS ÚTILES:"
echo "- Ver logs: sudo tail -f /var/log/supervisor/insssep_out.log"
echo "- Reiniciar app: sudo supervisorctl restart insssep"
echo "- Estado app: sudo supervisorctl status insssep"
echo -e "${NC}"

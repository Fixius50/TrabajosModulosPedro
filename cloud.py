import subprocess
import json
import os
import sys
import shutil

# ==========================================
# VARIABLES DE CONFIGURACIÓN
# ==========================================
PROJECT_ID = "gen-lang-client-0014683695"
REGION = "us-central1"
DISPLAY_NAME = "Stitch_MCP_Key_Auto"

# Roles necesarios para Stitch
ROLES = [
    "roles/aiplatform.user",
    "roles/serviceusage.serviceUsageConsumer",
    "roles/resourcemanager.tagUser"
]

# APIs que deben estar activas
APIS = [
    "aiplatform.googleapis.com",
    "generativelanguage.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "apikeys.googleapis.com"  # Needed for API Key creation
]

def run_cmd(command):
    """Ejecuta un comando de shell y retorna el resultado."""
    print(f"🔹 Ejecutando: {command}")
    try:
        # shell=True is required for complex commands but verify gcloud path
        # Using utf-8 encoding for output
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True, encoding='utf-8')
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"❌ Error ejecutando comando.")
        print(f"Detalle Stderr: {e.stderr}")
        # Don't exit immediately, let the caller decide or continue if possible (except critical steps)
        return None

def get_gcloud_path():
    """Finds gcloud executable in path."""
    gcloud_path = shutil.which("gcloud")
    if not gcloud_path:
        # Common windows fallback
        possible_path = os.path.expandvars(r"%LOCALAPPDATA%\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd")
        if os.path.exists(possible_path):
            return possible_path
    return "gcloud"

def main():
    print(f"🚀 Iniciando configuración de Stitch MCP para Windows.")
    print(f"📍 Proyecto: {PROJECT_ID}")
    
    gcloud_bin = get_gcloud_path()

    # 1. Verificar si gcloud está instalado
    if not run_cmd(f'"{gcloud_bin}" --version'):
        print("❌ gcloud CLI no encontrado en el PATH. Por favor instala Google Cloud SDK.")
        sys.exit(1)

    # 2. Configurar el proyecto activo
    print(f"\n--- 1. Configurando proyecto activo ---")
    run_cmd(f'"{gcloud_bin}" config set project {PROJECT_ID}')

    # 3. Obtener el email de la cuenta activa
    print(f"\n--- 2. Verificando autenticación ---")
    user_email = run_cmd(f'"{gcloud_bin}" config get-value account')
    if not user_email:
        print("❌ No hay una cuenta activa.")
        print("⚠️ Se abrirá el navegador para autenticarte...")
        subprocess.run(f'"{gcloud_bin}" auth login', shell=True)
        user_email = run_cmd(f'"{gcloud_bin}" config get-value account')
    
    print(f"✅ Cuenta detectada: {user_email}")

    # 4. Habilitar APIs
    print(f"\n--- 3. Habilitando APIs necesarias ---")
    for api in APIS:
        # Check if enabled first to save time? run_cmd handles idempotency relatively well for enable
        run_cmd(f'"{gcloud_bin}" services enable {api}')

    # 5. Asignar Roles de IAM
    print(f"\n--- 4. Asignando Roles de IAM ---")
    print("Nota: Esto requiere permisos de Administrador/Owner en el proyecto.")
    for role in ROLES:
        # WINDOWS FIX: Use double quotes for the arguments
        cmd = f'"{gcloud_bin}" projects add-iam-policy-binding {PROJECT_ID} --member="user:{user_email}" --role="{role}"'
        run_cmd(cmd)

    # 6. Configurar ADC
    print("\n--- 5. Configurando Credenciales Locales (ADC) ---")
    print("⚠️  Si se abre una ventana, inicia sesión nuevamente.")
    subprocess.run(f'"{gcloud_bin}" auth application-default login', shell=True)
    run_cmd(f'"{gcloud_bin}" auth application-default set-quota-project {PROJECT_ID}')

    # 7. Crear API Key para Stitch (Método Robusto)
    print("\n--- 6. Generando API Key para Stitch ---")
    # Check if key exists
    list_keys = run_cmd(f'"{gcloud_bin}" alpha services api-keys list --filter="displayName:{DISPLAY_NAME}" --format="value(name)"')
    
    key_resource_name = None
    if list_keys and "projects/" in list_keys:
        print("✅ La API Key ya existe.")
        key_resource_name = list_keys.split("\n")[0].strip()
    else:
        print("Creating new API Key...")
        # Create key
        create_output = run_cmd(f'"{gcloud_bin}" alpha services api-keys create --display-name="{DISPLAY_NAME}" --format="value(name)"')
        if create_output:
            key_resource_name = create_output.strip()

    api_key_string = ""
    if key_resource_name:
        # Get the actual key string
        api_key_string = run_cmd(f'"{gcloud_bin}" alpha services api-keys get-key-string {key_resource_name} --format="value(keyString)"')
        
    if not api_key_string:
        print("❌ No se pudo recuperar la API Key. Se usará configuración manual.")
        print("Asegúrate de tener instalados los componentes alpha: gcloud components install alpha")
    else:
        print(f"✅ API Key recuperada: {api_key_string[:5]}...*****")

    # 8. Generar configuración MCP
    print("\n--- 7. Generando archivo mcp_config.json ---")
    
    mcp_config = {
        "mcpServers": {
             "stitch": {
                "serverUrl": "https://stitch.googleapis.com/mcp",
                "headers": {
                    "X-Goog-Api-Key": api_key_string if api_key_string else "TU_API_KEY_AQUI"
                }
            }
        }
    }

    config_path = os.path.join(os.getcwd(), "mcp_config.json")
    try:
        with open(config_path, "w", encoding='utf-8') as f:
            json.dump(mcp_config, f, indent=2)
        print(f"📂 Archivo generado: {config_path}")
    except Exception as e:
        print(f"❌ Error escribiendo archivo: {e}")

    print("\n" + "="*60)
    print("✅ INSTALACIÓN COMPLETADA")
    print("El archivo `mcp_config.json` ha sido actualizado.")
    print("👉 Por favor, REINICIA tu editor/agente para aplicar los cambios.")
    print("="*60)

if __name__ == "__main__":
    main()
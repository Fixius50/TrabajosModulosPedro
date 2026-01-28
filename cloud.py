import subprocess
import json
import os
import sys

# ==========================================
# VARIABLES DE CONFIGURACIÓN
# ==========================================
PROJECT_ID = "gen-lang-client-0014683695"
REGION = "us-central1"
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
    "cloudresourcemanager.googleapis.com"
]

def run_cmd(command):
    """Ejecuta un comando de shell y retorna el resultado."""
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"❌ Error ejecutando: {command}")
        print(f"Detalle: {e.stderr}")
        return None

def main():
    print(f"🚀 Iniciando configuración de Stitch MCP para el proyecto: {PROJECT_ID}\n")

    # 1. Verificar si gcloud está instalado
    if not run_cmd("gcloud --version"):
        print("❌ gcloud CLI no encontrado. Instálalo primero.")
        sys.exit(1)

    # 2. Configurar el proyecto activo
    print(f"--- Configurando proyecto activo a {PROJECT_ID} ---")
    run_cmd(f"gcloud config set project {PROJECT_ID}")

    # 3. Obtener el email de la cuenta activa
    user_email = run_cmd("gcloud config get-value account")
    if not user_email:
        print("❌ No hay una cuenta activa. Ejecuta 'gcloud auth login' primero.")
        sys.exit(1)
    print(f"✅ Cuenta detectada: {user_email}")

    # 4. Habilitar APIs
    for api in APIS:
        print(f"--- Habilitando API: {api} ---")
        run_cmd(f"gcloud services enable {api}")

    # 5. Asignar Roles de IAM
    for role in ROLES:
        print(f"--- Asignando rol: {role} ---")
        run_cmd(f"gcloud projects add-iam-policy-binding {PROJECT_ID} --member='user:{user_email}' --role='{role}'")

    # 6. Configurar ADC y Quota Project
    print("\n--- Configurando Application Default Credentials (ADC) ---")
    print("⚠️ Se abrirá una ventana en tu navegador. Por favor, completa el login.")
    subprocess.run("gcloud auth application-default login", shell=True)
    
    print(f"--- Estableciendo proyecto de cuota: {PROJECT_ID} ---")
    run_cmd(f"gcloud auth application-default set-quota-project {PROJECT_ID}")

    # 7. Intentar crear el tag de entorno (Opcional, no bloqueante)
    print("--- Intentando configurar tag de entorno ---")
    tag_cmd = (f"gcloud resource-manager tags bindings create "
               f"--parent=//cloudresourcemanager.googleapis.com/projects/{PROJECT_ID} "
               f"--tag-value=tagValues/development")
    # No usamos check=True aquí porque puede fallar si el tag ya existe o no hay permisos de Org
    subprocess.run(tag_cmd, shell=True, capture_output=True)

    # 8. Generar configuración MCP para el IDE
    mcp_config = {
        "mcpServers": {
            "stitch": {
                "command": "npx",
                "args": [
                    "-y",
                    "@google/stitch-mcp",
                    "--project", PROJECT_ID,
                    "--location", REGION
                ]
            }
        }
    }

    config_path = os.path.join(os.getcwd(), "mcp_config.json")
    with open(config_path, "w") as f:
        json.dump(mcp_config, f, indent=2)

    print("\n" + "="*50)
    print("✅ CONFIGURACIÓN COMPLETADA CON ÉXITO")
    print(f"📂 Se ha generado el archivo: {config_path}")
    print(f"👉 Copia el contenido de ese JSON en la configuración de MCP de Antigravity.")
    print("="*50)

if __name__ == "__main__":
    main()
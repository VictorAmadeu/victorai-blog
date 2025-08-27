# ex001_saludador.py
# ------------------------------------------------------------
# Programa: Saludador Interactivo
# Propósito: Mostrar "Hola, mundo", pedir el nombre del usuario
#            y saludarlo de forma personalizada.
# Plataforma: Windows 11 (pero funciona en cualquier SO con Python 3)
# Buenas prácticas aplicadas:
#   - Uso de función main()
#   - Comprobación de entrada vacía
#   - Tipos y docstrings
# ------------------------------------------------------------

from typing import Optional  # Importamos Optional para anotar tipos que pueden ser None

def solicitar_nombre() -> str:
    """
    Pide al usuario su nombre y devuelve una cadena no vacía.
    Si el usuario no escribe nada, repite la petición.
    """
    # Iniciamos un bucle hasta obtener un nombre válido (no vacío)
    while True:
        # input() muestra un mensaje y espera a que el usuario escriba y pulse Enter
        nombre: str = input("¿Cuál es tu nombre? ").strip()
        # strip() elimina espacios al principio y al final (evita "  Victor  ")
        if nombre:  # Si hay algún carácter tras eliminar espacios...
            return nombre  # ...devolvemos el nombre
        # Si estaba vacío, informamos y seguimos pidiendo
        print("❗ Por favor, escribe al menos un carácter.")

def construir_saludo(nombre: str) -> str:
    """
    Recibe un nombre y devuelve un mensaje de saludo formateado.
    """
    # Usamos una f-string para insertar variables en la cadena de forma clara y eficiente
    return f"Es un placer conocerte, {nombre}."

def main() -> None:
    """
    Función principal del programa.
    """
    # Mostramos un mensaje inicial para confirmar que el programa arrancó
    print("Hola, mundo 👋")
    # Llamamos a la función que solicita un nombre válido
    nombre_usuario: str = solicitar_nombre()
    # Construimos el saludo personalizado a partir del nombre
    mensaje: str = construir_saludo(nombre_usuario)
    # Mostramos el saludo final por pantalla
    print(mensaje)

# Este condicional garantiza que main() se ejecute solo si este archivo
# se ejecuta directamente (y no cuando se importa desde otro módulo).
if __name__ == "__main__":
    main()

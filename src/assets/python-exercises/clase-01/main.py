# main.py — Clase 1
# Objetivo:
# 1) Comprobar la versión de Python y la ruta del intérprete.
# 2) Imprimir "Hola, mundo" y hacer operaciones simples.
# 3) Mostrar el Zen de Python.
# 4) Demostrar que estamos en un script (no solo en el REPL).

import sys  # Módulo estándar para información del intérprete y del sistema

# 1) Mostrar versión de Python y ejecutable en uso
print("== Información del intérprete ==")                  # Encabezado legible
print("Versión:", sys.version)                             # Cadena detallada de versión (incluye build)
print("Ejecutable:", sys.executable)                       # Ruta al python.exe que está ejecutando este script
print()                                                    # Línea en blanco para separar secciones

# 2) ¡Hola, mundo! y operaciones aritméticas básicas
print("== Hola y operaciones ==")
print("Hola, mundo 👋")                                    # Primera salida clásica
suma = 2 + 5                                               # Operación de suma
print("2 + 5 =", suma)                                     # Mostrar resultado de la suma
producto = 7 * 6                                           # Otra operación
print("7 * 6 =", producto)
print()  

# 3) El Zen de Python
# 'import this' imprime el Zen al importar. También expone el texto en this.s
import this                                                # Al importar, muestra los aforismos en consola
print()                                                    # Separador tras el Zen

# 4) Confirmar que el script se ejecutó correctamente
print("Script ejecutado correctamente ✅")

# ejercicio_clase_04.py
# -*- coding: utf-8 -*-
# Clase 04: print, variables, input y scripts en VSCode (Windows 11)

# 1) --- Datos básicos del usuario ---
nombre = input("¿Cuál es tu nombre? ").strip()  # .strip() elimina espacios sobrantes al inicio/fin

# input() SIEMPRE devuelve 'str' (texto). Si luego necesitas operar, convierte.
edad_texto = input("¿Cuántos años tienes? ").strip()  # guardamos como texto de momento
peso_texto = input("¿Cuánto pesas? (puedes usar punto o coma) ").strip()

# Conversión recomendada:
# - Edad: entero (int)
# - Peso: flotante (float); si el usuario usa coma decimal, la cambiamos por punto
edad = int(edad_texto)                         # '25' -> 25
peso = float(peso_texto.replace(",", "."))     # '70,5' -> '70.5' -> 70.5

# Saludo usando print con comas (mezcla texto + variables)
print("Hola", nombre + ",", "¡placer en conocerte! 🤖")
print("Edad registrada:", edad, "años | Peso registrado:", peso, "kg")

# 2) --- Fecha de nacimiento formateada ---
dia_texto = input("Día de nacimiento (número): ").strip()
mes_texto = input("Mes de nacimiento (número o nombre): ").strip()
anio_texto = input("Año de nacimiento (4 dígitos): ").strip()

# Si el mes viene como número, lo traducimos a nombre en español
mes_mapa = {
    "1": "enero", "01": "enero",
    "2": "febrero", "02": "febrero",
    "3": "marzo", "03": "marzo",
    "4": "abril", "04": "abril",
    "5": "mayo", "05": "mayo",
    "6": "junio", "06": "junio",
    "7": "julio", "07": "julio",
    "8": "agosto", "08": "agosto",
    "9": "septiembre", "09": "septiembre",
    "10": "octubre",
    "11": "noviembre",
    "12": "diciembre"
}

# Si no está en el mapa, respetamos lo que el usuario escribió (en minúsculas)
mes_formateado = mes_mapa.get(mes_texto, mes_texto.lower())

# Mostramos la fecha formateada usando comas (como en la clase)
print("Naciste el día", dia_texto, "de", mes_formateado, "de", anio_texto, "¿correcto? 🗓️")

# 3) --- Suma: concatenación vs suma numérica ---
n1_texto = input("Escribe un número: ").strip()
n2_texto = input("Escribe otro número: ").strip()

# (a) Sin conversión: esto CONCATENA porque son cadenas
print("Demostración (sin conversión):", n1_texto + n2_texto)  # '6' + '3' -> '63'

# (b) Conversión para sumar de verdad (admitimos coma o punto)
n1 = float(n1_texto.replace(",", "."))
n2 = float(n2_texto.replace(",", "."))
suma = n1 + n2

print("La suma correcta es:", suma)  # 6.0 + 3.0 -> 9.0

# Nota: más adelante podrás validar errores (try/except) y formatear con f-strings.
# Hoy nos centramos en print(), variables, input() y diferencia entre texto vs número.

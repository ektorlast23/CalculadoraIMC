# Documentación técnica

Describe la versión que está en este repositorio: una aplicación de escritorio
Electron con la interfaz en HTML, CSS y JavaScript. No hay servidor, base de
datos ni llamadas a servicios externos.

Versión documentada: 1.0.0 · Electron 31.7.7 (empaquetado) · Node.js 24.18.1
(probado).

## 1. Qué hace

Pide peso en kilogramos y altura en metros, calcula el índice de masa corporal
y muestra el valor con dos decimales junto a su clasificación. El cálculo se
hace íntegramente en la ventana; no se guarda nada entre ejecuciones.

## 2. Ejecutar y empaquetar

```bash
npm install    # instala Electron y electron-packager
npm start      # abre la ventana
npm run package
```

`npm run package` usa `electron-packager` y deja el resultado en
`dist/CalculadoraIMC-win32-x64/CalculadoraIMC.exe`. En Windows se puede hacer
lo mismo con doble clic en `build_desktop.bat`, que fija el directorio de
trabajo con `cd /d "%~dp0"` antes de invocar npm.

El ejecutable pesa alrededor de 172 MB porque incluye el runtime completo de
Chromium. No está firmado, así que SmartScreen puede advertir la primera vez.

## 3. Arquitectura

```
main.js                  proceso principal (Node)
  └─ BrowserWindow       ventana nativa de 420x700
       └─ web/index.html renderer (Chromium, sin Node)
            ├─ style.css
            └─ script.js
```

El proceso principal solo crea la ventana y carga el HTML:

- `width: 420`, `height: 700`, `resizable: false`, `maximizable: false`.
- `autoHideMenuBar: true` para ocultar la barra de menú.
- `backgroundColor: '#0b0813'`, el mismo fondo del CSS, para que no haya un
  destello blanco entre la creación de la ventana y el primer pintado.
- `nodeIntegration: false` y `contextIsolation: true`: el renderer no tiene
  acceso a Node ni a `require`. No hay `preload`, ni IPC, ni permisos
  adicionales; la aplicación no los necesita.

Sobre macOS se recrea la ventana al hacer clic en el icono del Dock y el
proceso no termina al cerrar la última ventana.

## 4. Flujo de una consulta

1. La interfaz se enlaza a los elementos del DOM en `DOMContentLoaded`.
2. El cálculo se dispara con el botón o con Enter en cualquiera de los dos
   campos. El botón es `type="button"`, así que no envía el formulario.
3. Se leen y recortan los valores de los inputs.
4. Se valida; si algo falla, se muestra el mensaje y se corta el flujo.
5. Se calcula el IMC y se elige la categoría.
6. Se aplican las clases de color, se escribe el resultado y se quita la clase
   `hidden` del contenedor de resultados.

## 5. Entrada y validación

Los campos son `type="text"` con `inputmode="decimal"`, no `type="number"`:
así el usuario puede escribir la coma decimal y el navegador no impone sus
propias reglas de incremento ni notación científica.

| Regla | Comportamiento |
|---|---|
| Coma decimal | `70,5` se convierte en `70.5` antes de parsear |
| Punto decimal | Se acepta tal cual: `70.5`, `1.75` |
| Campo vacío | «Por favor, completa ambos campos.» |
| Texto no numérico | «Ingresa números válidos mayores a cero.» |
| Cero o negativo | Mismo mensaje que el texto no numérico |
| Altura mayor a 3 m | «La altura debe ser en metros (ej. 1.75).» |

La validación se apoya en `parseFloat`, que ignora lo que sigue al número:
`70kg` se interpreta como 70 y `1,75m` como 1,75. Es tolerante a propósito,
pero también significa que no rechaza sufijos. No hay límite superior para el
peso ni límite inferior razonable para la altura (0,5 m se acepta).

## 6. Cálculo y clasificación

```
IMC = peso (kg) / altura (m)²
```

Redondeo solo para mostrar: `imc.toFixed(2)`. La comparación usa el valor
completo, no el redondeado, así que un IMC de 24,999 se muestra como `25.00`
pero se clasifica como «Peso normal». Es el único punto donde el número visible
y la etiqueta pueden no coincidir; en la práctica se resuelve redondeando
primero si se prefiere coherencia visual.

| IMC | Clasificación | Clase CSS | Color |
|---|---|---|---|
| < 18,5 | Bajo peso | `bajo-peso` | azul `#38bdf8` |
| 18,5 – 24,9 | Peso normal | `normal` | verde `#10b981` |
| 25,0 – 29,9 | Sobrepeso | `sobrepeso` | ámbar `#f59e0b` |
| ≥ 30,0 | Obesidad | `obesidad` | rojo `#ef4444` |

Son los cortes de la OMS para adultos. La aplicación no pide edad, sexo ni
contexto, así que el resultado es una referencia poblacional, no un
diagnóstico.

## 7. Resultado y errores en pantalla

`displayResult` limpia las clases anteriores, aplica la de la categoría al
número, a la etiqueta y al borde de la tarjeta, y escribe los textos.

`displayError` reutiliza la categoría `obesidad`: el mensaje se muestra en rojo
con el borde rojo de la tarjeta. Funciona visualmente, pero es una decisión de
implementación, no un estado de error propio. Si se agregan más mensajes o se
quiere distinguir «error de entrada» de «obesidad», conviene crear clases
`error` y `error-border` en lugar de reutilizar las de la última categoría.

El contenedor de resultados permanece oculto por defecto (`hidden`) y se
muestra con una animación de entrada (`fadeInUp`, 0,5 s). Un error posterior
sobreescribe el resultado anterior; no queda historial.

## 8. Interfaz y estilos

Todos los colores están como variables en `:root` al principio de
`web/style.css`; cambiar ahí el acento o los colores de categoría no requiere
tocar el resto del archivo.

- Estética glassmorphism: tarjeta con fondo translúcido, `backdrop-filter:
  blur(20px)` y borde de 1 px.
- Dos círculos desenfocados (`filter: blur(120px)`) como decoración de fondo.
- Tipografías Outfit y Poppins desde Google Fonts. Sin internet se usan las
  del sistema; la aplicación sigue funcionando igual.
- `user-select: none` en todo el documento para que no se seleccione texto por
  accidente en una app nativa, con excepción de los inputs, que lo reactivan.
- Los inputs quitan el `outline` y marcan el foco cambiando el color del borde
  a `#a78bfa`.
- La ventana no es redimensionable, así que no hay media queries: el diseño
  está pensado para 420x700.

## 9. Limitaciones conocidas

- No hay pruebas automatizadas ni linter configurado. La verificación es
  manual y `node --check` sobre los archivos JavaScript.
- El redondeo se aplica después de clasificar (ver sección 6).
- No hay historial, exportación ni persistencia. Cerrar la ventana descarta
  todo.
- Solo unidades métricas: kg y m. No hay conversión desde libras ni pies.
- La interfaz no expone el resultado a lectores de pantalla con `aria-live`;
  el cambio en el DOM no se anuncia.
- El ejecutable no está firmado digitalmente.

## 10. Dónde cambiar cada cosa

| Cambio | Archivo |
|---|---|
| Tamaño o comportamiento de la ventana | `main.js` |
| Fórmula y cortes de clasificación | `web/script.js`, `calculateIMC` |
| Mensajes de validación | `web/script.js`, `displayError` |
| Colores y tipografías | `web/style.css`, bloque `:root` |
| Textos, campos y estructura | `web/index.html` |
| Datos del paquete y versión | `package.json` |

## 11. Privacidad

No hay peticiones de red salvo las fuentes de Google Fonts al abrir la
ventana, y no se envía ningún dato del usuario: los valores existen solo en la
memoria del renderer. No se escribe en disco ni se leen archivos.

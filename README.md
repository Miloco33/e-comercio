# e-comercio

Tienda de electrónica hecha como pieza de un portfolio personal. Es un sitio estático: se puede abrir junto con otros proyectos y no necesita backend.

La marca, los precios y los pedidos son de demostración. Nada de lo que se confirma en el carrito genera un cobro.

## Qué se puede recorrer

- **Inicio**, con un carrusel, categorías y ofertas del día.
- **Productos**, con búsqueda por nombre y filtro por categoría.
- **Carrito**, para sumar, restar o quitar unidades.
- **Mis compras**, donde queda el pedido de demostración.
- **Mi cuenta**, una sesión local de este navegador. La contraseña no se guarda.

Los productos son una laptop, un celular, un televisor y un CPU. El carrito y la sesión viven en `localStorage`.

## Cómo verla

Abre `index.html` en el navegador, o sirve la carpeta para que las rutas relativas se comporten igual en todas las páginas:

```bash
python -m http.server 5500
```

Después entra a `http://127.0.0.1:5500`.

## Tecnologías

HTML, CSS y JavaScript, sin frameworks ni dependencias.

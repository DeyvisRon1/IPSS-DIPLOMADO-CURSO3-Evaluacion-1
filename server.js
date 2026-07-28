// ─────────────────────────────────────────────────────────────────────────────
// Evaluación 1 · API del Mundial 2026
// Diplomado IPS · Módulo 3 — Backend y APIs REST
//
// Este es tu punto de partida. Los DATOS ya están (datos-mundial.js): el resto
// lo escribes tú.
//
// ANTES DE EMPEZAR — instala lo que necesites. Por ejemplo:
//     npm install express
//     npm install cors
//
// Para levantar el servidor:
//     npm run dev        (se reinicia solo al guardar)
// ─────────────────────────────────────────────────────────────────────────────

import { continentes, grupos, selecciones, partidos } from './datos-mundial.js'
import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())



const PORT = 3000

// ─────────────────────────────────────────────────────────────────────────────
// TUS RUTAS
//
// Este es el mapa de lo que tienes que construir. El detalle completo de cada
// una (qué recibe, qué devuelve, qué status) está en el enunciado: léelo.
//
//   ── Base ──────────────────────────────────────────────────────────────────
//   GET  /api/selecciones                     todas
//   GET  /api/selecciones/:id                 una, o 404
//
//   ── Con lógica ⭐ ──────────────────────────────────────────────────────────
//   GET  /api/selecciones?continente=Europa   filtra por continente  (anidada)
//   GET  /api/selecciones?campeon=true        solo las que ganaron alguna copa
//   GET  /api/copas                           todas las copas, en una lista plana
//   GET  /api/copas/:seleccion                las copas de una (por NOMBRE), o 404
//   GET  /api/estadisticas                    resumen del torneo         (vale 2%)
//
//   ── Semifinales y final ⭐ ─────────────────────────────────────────────────
//   POST /api/worldcup/2026/semifinals/:n     registra la semifinal n (1 a 4)
//   GET  /api/worldcup/2026/semifinals/:n     el resultado de la semifinal n
//   GET  /api/worldcup/2026/semifinals        las cuatro
//   POST /api/worldcup/2026/final             registra la final
//   GET  /api/worldcup/2026/final             la final, con su ganador
//
// Ojo: /semifinals/:n es UNA ruta, no cuatro.
// ─────────────────────────────────────────────────────────────────────────────

// Ejemplo para que veas el formato. Bórralo o quédatelo, como prefieras:
//
//   app.get('/api/selecciones', (req, res) => {
//     res.json(selecciones)
//   })
//
// A partir de aquí, es tuyo. 🚀


app.get('/api/selecciones', (req, res) => {
    let resultado = selecciones
   const { continente, campeon } = req.query

    if (continente) {
        const continenteEncontrado = continentes.find(
            (c) => c.nombre.toLowerCase() === continente.toLowerCase()
        )
        if (!continenteEncontrado) {
            return res.status(404).json({ error: `No existe el continente "${continente}"` })
        }

        resultado = resultado.filter((s) => s.continenteId === continenteEncontrado.id)
    }

        if (campeon === 'true') {
        resultado = resultado.filter((s) => s.copas.length > 0)
    }


    res.status(200).json(resultado)
})

app.get('/api/selecciones/:id', (req, res) => {
    const id = Number(req.params.id)

    const seleccion = selecciones.find((s) => s.id === id)

    if (!seleccion) {
       return res.status(404).json({ error: `No existe la selección ${req.params.id}` })
    }

    res.status(200).json(seleccion)
})

app.get('/api/copas', (req, res) => {
    const todasLasCopas = selecciones.flatMap((s) => s.copas)
    res.status(200).json(todasLasCopas)
})

app.get('/api/copas/:seleccion', (req, res) => {
    const nombreBuscado = req.params.seleccion

    const seleccionEncontrada = selecciones.find(
        (s) => s.nombre.toLowerCase() === nombreBuscado.toLowerCase()
    )

    if (!seleccionEncontrada) {
        return res.status(404).json({ error: `No existe la selección "${nombreBuscado}"` })
    }

    res.status(200).json(seleccionEncontrada.copas)
})

// A partir de aquí, es tuyo. 🚀

// TODO: levanta el servidor.
//
app.listen(PORT, () => {
  console.log(`⚽ API del Mundial escuchando en http://localhost:${PORT}`)
})

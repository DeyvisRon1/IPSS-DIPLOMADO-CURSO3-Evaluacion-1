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

function resolverSeleccion(id) {
    return selecciones.find((s) => s.id === id)
}

function validarCuerpoPartido(body) {
    if (!body || !body.local || !body.visita) {
        return 'Se requieren "local" y "visita"'
    }
    if (typeof body.local.seleccionId !== 'number' || typeof body.local.goles !== 'number') {
        return '"local" debe tener seleccionId y goles numéricos'
    }
    if (typeof body.visita.seleccionId !== 'number' || typeof body.visita.goles !== 'number') {
        return '"visita" debe tener seleccionId y goles numéricos'
    }
    if (!resolverSeleccion(body.local.seleccionId)) {
        return `No existe la selección ${body.local.seleccionId}`
    }
    if (!resolverSeleccion(body.visita.seleccionId)) {
        return `No existe la selección ${body.visita.seleccionId}`
    }
    return null
}

function formatearPartido(nombrePartido, partido) {
    const local = resolverSeleccion(partido.local.seleccionId)
    const visita = resolverSeleccion(partido.visita.seleccionId)

    let ganador
    if (partido.local.goles > partido.visita.goles) {
        ganador = local.nombre
    } else if (partido.visita.goles > partido.local.goles) {
        ganador = visita.nombre
    } else {
        ganador = 'Empate'
    }

    return {
        partido: nombrePartido,
        local: { seleccion: local.nombre, goles: partido.local.goles },
        visita: { seleccion: visita.nombre, goles: partido.visita.goles },
        ganador,
    }
}

app.post('/api/worldcup/2026/semifinals/:n', (req, res) => {
    const n = Number(req.params.n)
    if (!Number.isInteger(n) || n < 1 || n > 4) {
        return res.status(400).json({ error: 'El número de semifinal debe ser entre 1 y 4' })
    }

    const errorValidacion = validarCuerpoPartido(req.body)
    if (errorValidacion) {
        return res.status(400).json({ error: errorValidacion })
    }

    const nuevoPartido = { numero: n, local: req.body.local, visita: req.body.visita }
    const indice = partidos.semifinales.findIndex((p) => p.numero === n)
    if (indice >= 0) {
        partidos.semifinales[indice] = nuevoPartido
    } else {
        partidos.semifinales.push(nuevoPartido)
    }

    res.status(201).json(formatearPartido(`semifinal ${n}`, nuevoPartido))
})

app.get('/api/worldcup/2026/semifinals/:n', (req, res) => {
    const n = Number(req.params.n)
    const partido = partidos.semifinales.find((p) => p.numero === n)
    if (!partido) {
        return res.status(404).json({ error: `La semifinal ${n} aún no se ha jugado` })
    }
    res.status(200).json(formatearPartido(`semifinal ${n}`, partido))
})

app.get('/api/worldcup/2026/semifinals', (req, res) => {
    const todas = [1, 2, 3, 4].map((n) => {
        const partido = partidos.semifinales.find((p) => p.numero === n)
        return partido ? formatearPartido(`semifinal ${n}`, partido) : { partido: `semifinal ${n}`, jugado: false }
    })
    res.status(200).json(todas)
})

app.post('/api/worldcup/2026/final', (req, res) => {
    const errorValidacion = validarCuerpoPartido(req.body)
    if (errorValidacion) {
        return res.status(400).json({ error: errorValidacion })
    }

    partidos.final = { local: req.body.local, visita: req.body.visita }
    res.status(201).json(formatearPartido('final', partidos.final))
})

app.get('/api/worldcup/2026/final', (req, res) => {
    if (!partidos.final) {
        return res.status(404).json({ error: 'La final aún no se ha jugado' })
    }
    res.status(200).json(formatearPartido('final', partidos.final))
})

// A partir de aquí, es tuyo. 🚀

// TODO: levanta el servidor.
//
app.listen(PORT, () => {
  console.log(`⚽ API del Mundial escuchando en http://localhost:${PORT}`)
})

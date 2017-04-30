#!/usr/bin/env node
const fs = require('fs')
const d3 = require('d3-queue')
const path = require('path')
const load = require('load-json-file')
const meow = require('meow')
const glob = require('glob')
const range = require('lodash.range')
const write = require('write-json-file')
const axios = require('axios')
const mkdirp = require('mkdirp')
const Protobuf = require('pbf')
const mercator = require('global-mercator')
const slippyGrid = require('slippy-grid')
const slippyTile = require('slippy-tile')
const ProgressBar = require('progress')
const {VectorTile} = require('@mapbox/vector-tile')
const {featureEach} = require('@turf/meta')
const {featureCollection} = require('@turf/helpers')

const cli = meow(`
    Usage:
      $ node index.js <geojson>

    Options:
      --verbose        Output verbose messages on internal operations

    Examples:
      $ node index.js "extents/ottawa.geojson"
`, {
  alias: {v: 'verbose'},
  boolean: 'verbose'
})

/**
 * Required Flags
 */
if (cli.input.length === 0) throw new Error('<geojson> is required')
if (!fs.existsSync(cli.input[0])) throw new Error('<geojson> filepath does not exist')
const geojson = load.sync(cli.input[0])

async function main () {
  const total = slippyGrid.count(geojson, 14, 14)
  const bar = new ProgressBar('  downloading [:bar] :percent (:current/:total)', {
    total,
    width: 20
  })

  // Iterate over each tile
  const queue = d3.queue(25)
  const grid = slippyGrid.single(geojson, 14, 14)

  while (true) {
    const {value, done} = grid.next()
    if (done) break

    queue.defer(async callback => {
      bar.tick()
      const tile = mercator.tileToGoogle(value)
      const [x, y, z] = tile.map(v => String(v))

      // Only download tiles that don't exist
      let data
      if (!fs.existsSync(path.join('upload', 'images', z, x, y + '.geojson'))) {
        data = await requestVectorTile(tile)
      }

      // Store Results
      if (data) {
        const images = vectorTileToGeoJSON(data, 'mapillary-images', tile)
        const sequences = vectorTileToGeoJSON(data, 'mapillary-sequences', tile)

        // Save Images
        mkdirp(path.join(__dirname, 'upload', 'images', z, x), () => {
          write.sync(path.join(__dirname, 'upload', 'images', z, x, y + '.geojson'), images)
        })

        // Save Sequences
        mkdirp(path.join(__dirname, 'upload', 'sequences', z, x), () => {
          write.sync(path.join(__dirname, 'upload', 'sequences', z, x, y + '.geojson'), sequences)
        })
      }
      callback(null)
    })
  }
  queue.awaitAll(() => {
    // Group all GeoJSON tiles to single file
    const directory = path.join(__dirname, 'upload') + path.sep
    writeStreamToGeoJSON(path.join(directory, 'images', '**', '*.geojson'), directory + 'images.geojson')
    writeStreamToGeoJSON(path.join(directory, 'sequences', '**', '*.geojson'), directory + 'sequences.geojson')
  })
}
main()

/**
 * Write Stream from folder to GeoJSON
 *
 * @param {string} pattern
 * @param {string} output
 * @return {void}
 */
function writeStreamToGeoJSON (pattern, output) {
  const writer = fs.createWriteStream(output)
  writer.write('{\n')
  writer.write('"type": "FeatureCollection",\n')
  writer.write('"features": [\n')
  const files = glob.sync(pattern)
  files.forEach((file, index) => {
    const geojson = load.sync(file)
    featureEach(geojson, (feature, featureIndex) => {
      writer.write(JSON.stringify(feature))
      if (index !== files.length - 1 || featureIndex !== geojson.features.length - 1) {
        writer.write(',\n')
      }
    })
  })
  writer.end('\n]\n}')
}

/**
 * Request VectorTile
 *
 * @param {Tile} tile [x, y, z]
 * @returns {Buffer} Vector Tile Buffer
 */
async function requestVectorTile (tile) {
  const url = slippyTile(tile, 'https://d25uarhxywzl1j.cloudfront.net/v0.1/{z}/{x}/{y}.mvt')

  // Request vector tile from Mapillary
  return axios.get(url, {responseType: 'arraybuffer'})
    .then(response => response.data, error => error)
}

/**
 * Convert VectorTile to GeoJSON
 *
 * @param {Buffer} data Raw data
 * @param {string} layer layer to extract
 * @param {Tile} tile [x, y, z]
 * @returns {FeatureCollection} GeoJSON FeatureCollection
 */
function vectorTileToGeoJSON (data, layer, tile) {
  const [x, y, z] = tile
  const results = featureCollection([])
  const vt = new VectorTile(new Protobuf(data))
  const result = vt.layers[layer]

  if (result) {
    range(result.length).forEach(i => {
      const feature = result.feature(i).toGeoJSON(x, y, z)
      results.features.push(feature)
    })
  }
  return results
}

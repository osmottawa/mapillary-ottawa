# Mapillary Ottawa

Mapillary Images & Sequences for the City of Ottawa.

Before using this data, one must agree with the [Terms and Conditions](https://www.mapillary.com/terms) of Mapillary.

## Usage

All Mapillary data has already been converted to GeoJSON and are stored in this GitHub repo.

### Full GeoJSON

- [`s3://mapillary/ottawa-gatineau/images.geojson`](https://s3.amazonaws.com/mapillary/ottawa-gatineau/images.geojson)
- [`s3://mapillary/ottawa-gatineau/sequences.geojson`](https://s3.amazonaws.com/mapillary/ottawa-gatineau/sequences.geojson)

### Tiled GeoJSON

- `s3://mapillary/ottawa-gatineau/images/{z}/{x}/{y}.geojson`
- `s3://mapillary/ottawa-gatineau/sequences/{z}/{x}/{y}.geojson`

## Updates

Updates will be done weekly or daily (not implemented yet).

### Manual Update

```bash
$ npm install
$ npm start
$ npm run upload-s3
```
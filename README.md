# Mapillary Data - Ottawa/Gatineau

Pre-processed Mapillary **Images** & **Sequences** for the City of Ottawa & Gatineau.

Before using this data, one must agree with the [Terms and Conditions](https://www.mapillary.com/terms) of Mapillary.

![image](https://cloud.githubusercontent.com/assets/550895/25558392/c510fe7c-2cf3-11e7-9f07-0abf51c870e9.png)

## Usage

All Mapillary Images & Sequences have already been converted to GeoJSON and are currently being stored on Amazon's S3 buckets.

### Full GeoJSON

- [`s3://mapillary/ottawa-gatineau/images.geojson`](https://s3.amazonaws.com/mapillary/ottawa-gatineau/images.geojson)
- [`s3://mapillary/ottawa-gatineau/sequences.geojson`](https://s3.amazonaws.com/mapillary/ottawa-gatineau/sequences.geojson)

### Tiled GeoJSON

- `s3://mapillary/ottawa-gatineau/images/{z}/{x}/{y}.geojson`
- `s3://mapillary/ottawa-gatineau/sequences/{z}/{x}/{y}.geojson`

## Updates

Updates will be done weekly or daily (not implemented yet).

### Manual Updates

```bash
$ npm install
$ npm start
$ npm run upload-s3
```

### Docker Updates

```bash
$ docker build -t mapillary-ottawa .
$ docker run --rm -it \
  -v upload:/src/upload \
  -e "AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}" \
  -e "AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}" \
  -e "AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}" \
  mapillary-ottawa

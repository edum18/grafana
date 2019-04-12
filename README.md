[Grafana](https://grafana.com) [![Circle CI](https://circleci.com/gh/grafana/grafana.svg?style=svg)](https://circleci.com/gh/grafana/grafana) [![Go Report Card](https://goreportcard.com/badge/github.com/grafana/grafana)](https://goreportcard.com/report/github.com/grafana/grafana) [![codecov](https://codecov.io/gh/grafana/grafana/branch/master/graph/badge.svg)](https://codecov.io/gh/grafana/grafana)
================
[Website](https://grafana.com) |
[Twitter](https://twitter.com/grafana) |
[Community & Forum](https://community.grafana.com)

Grafana is an open source, feature rich metrics dashboard and graph editor for
Graphite, Elasticsearch, OpenTSDB, Prometheus and InfluxDB.

<!---
![](http://docs.grafana.org/assets/img/features/dashboard_ex1.png)
-->

## Download latest official release
Head to [docs.grafana.org](http://docs.grafana.org/installation/) for documentation or [download](https://grafana.com/get) to get the latest release.

## Documentation & Support
Be sure to read the [getting started guide](http://docs.grafana.org/guides/gettingstarted/) and the other feature guides.

## Contribute to master
If you want to build a package yourself, or contribute - here is a guide for how to do that. You can always find
the latest master builds [here](https://grafana.com/grafana/download)


### Get the project

Clone project and put it in your go-path.<br>
Create the folders if you don't have them. The result is a grafana folder inside another grafana folder.
```bash
cd $GOPATH/src/github.com/grafana
git clone <grafana.git> grafana

Ex: C:/Users/sinmetro/go/src/github.com/grafana/grafana
```

### Building

#### The backend

```bash
go run build.go setup
go run build.go build
```

#### Frontend assets

```bash
yarn install --pure-lockfile
yarn start
```

### Run and rebuild on source change

#### Backend

To run the backend and rebuild on source change:

```bash
$GOPATH/bin/bra run
```

#### Frontend

Rebuild on file change, and serve them by Grafana's webserver (http://localhost:3000):

```bash
yarn start
```

Build the assets, rebuild on file change with Hot Module Replacement (HMR), and serve them by webpack-dev-server (http://localhost:3333):

```bash
yarn start:hot
# OR set a theme
env GRAFANA_THEME=light yarn start:hot
```

*Note: HMR for Angular is not supported. If you edit files in the Angular part of the app, the whole page will reload.*

**Open grafana in your browser (default: e.g. `http://localhost:3000`).**
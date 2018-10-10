package api

import (
	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models"
)

func StarDashboard(c *m.ReqContext) Response {
	if !c.IsSignedIn {
		return Error(412, "Tem de fazer login para marcar um dashboard como favorito.", nil)
	}

	cmd := m.StarDashboardCommand{UserId: c.UserId, DashboardId: c.ParamsInt64(":id")}

	if cmd.DashboardId <= 0 {
		return Error(400, "ID de dashboard em falta!", nil)
	}

	if err := bus.Dispatch(&cmd); err != nil {
		return Error(500, "Falha ao marcar dashboard como favorito.", err)
	}

	return Success("Marcou um dashboard como favorito.")
}

func UnstarDashboard(c *m.ReqContext) Response {

	cmd := m.UnstarDashboardCommand{UserId: c.UserId, DashboardId: c.ParamsInt64(":id")}

	if cmd.DashboardId <= 0 {
		return Error(400, "ID de dashboard em falta!", nil)
	}

	if err := bus.Dispatch(&cmd); err != nil {
		return Error(500, "Falha ao desmarcar dashboard como favorito.", err)
	}

	return Success("Desmarcou um dashboard como favorito.")
}

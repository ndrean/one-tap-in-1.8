defmodule LiveFlight.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  alias LiveFlight.Accounts.{User, UserToken}

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      LiveFlightWeb.Telemetry,
      LiveFlight.Repo,
      {Phoenix.PubSub, name: LiveFlight.PubSub},
      {EctoWatch,
       repo: LiveFlight.Repo,
       pub_sub: LiveFlight.PubSub,
       watchers: [
         {User, :inserted},
         {User, :updated},
         {UserToken, :inserted},
         {UserToken, :updated}
       ]},
      LiveFlight.Accounts.Notifier,
      {DNSCluster, query: Application.get_env(:live_flight, :dns_cluster_query) || :ignore},
      # Start a worker by calling: LiveFlight.Worker.start_link(arg)
      # {LiveFlight.Worker, arg},
      # Start to serve requests, typically the last entry
      LiveFlightWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: LiveFlight.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    LiveFlightWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end

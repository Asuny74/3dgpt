"use client";

import { useMemo, useState } from "react";

type Role = "client" | "atelier";
type MachineStatus = "en-marche" | "maintenance" | "arret";
type OrderStatus = "nouvelle" | "planifiee" | "en-production" | "terminee";

interface Machine {
  id: string;
  name: string;
  status: MachineStatus;
  currentOrder: string | null;
  nextAvailable: string;
}

interface Order {
  id: string;
  client: string;
  part: string;
  quantity: number;
  dueDate: string;
  priority: "haute" | "normale";
  status: OrderStatus;
  machineId: string | null;
}

interface TraceEvent {
  id: string;
  date: string;
  actor: "Client" | "Atelier";
  message: string;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  nouvelle: "Nouvelle",
  planifiee: "Planifiée",
  "en-production": "En production",
  terminee: "Terminée",
};

const MACHINE_STATUS_LABELS: Record<MachineStatus, string> = {
  "en-marche": "En marche",
  maintenance: "Maintenance",
  arret: "À l'arrêt",
};

export default function PlanificationPage() {
  const [role, setRole] = useState<Role>("client");
  const [machines, setMachines] = useState<Machine[]>([
    {
      id: "M-01",
      name: "Tornos Delta 20",
      status: "en-marche",
      currentOrder: "CMD-1042",
      nextAvailable: "2026-02-22 14:00",
    },
    {
      id: "M-02",
      name: "Citizen Cincom L12",
      status: "maintenance",
      currentOrder: null,
      nextAvailable: "2026-02-23 09:00",
    },
    {
      id: "M-03",
      name: "Star SR-20R",
      status: "en-marche",
      currentOrder: "CMD-1045",
      nextAvailable: "2026-02-22 17:30",
    },
  ]);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: "CMD-1042",
      client: "Client Aéro",
      part: "Axe inox Ø8",
      quantity: 1200,
      dueDate: "2026-02-24",
      priority: "haute",
      status: "en-production",
      machineId: "M-01",
    },
    {
      id: "CMD-1045",
      client: "MecaPrecision",
      part: "Bague laiton",
      quantity: 500,
      dueDate: "2026-02-25",
      priority: "normale",
      status: "planifiee",
      machineId: "M-03",
    },
    {
      id: "CMD-1048",
      client: "HydroTech",
      part: "Connecteur fileté",
      quantity: 850,
      dueDate: "2026-02-27",
      priority: "haute",
      status: "nouvelle",
      machineId: null,
    },
  ]);

  const [events, setEvents] = useState<TraceEvent[]>([
    {
      id: "TR-1",
      date: "2026-02-21 08:10",
      actor: "Atelier",
      message: "Commande CMD-1042 démarrée sur Tornos Delta 20.",
    },
    {
      id: "TR-2",
      date: "2026-02-21 09:20",
      actor: "Client",
      message: "Le client HydroTech a créé la commande CMD-1048.",
    },
    {
      id: "TR-3",
      date: "2026-02-21 10:00",
      actor: "Atelier",
      message: "Maintenance planifiée sur Citizen Cincom L12.",
    },
  ]);

  const [newOrder, setNewOrder] = useState({
    client: "",
    part: "",
    quantity: 100,
    dueDate: "",
    priority: "normale" as "haute" | "normale",
  });

  const [planningOrderId, setPlanningOrderId] = useState("CMD-1048");
  const [planningMachineId, setPlanningMachineId] = useState("M-03");

  const kpi = useMemo(() => {
    const running = machines.filter((m) => m.status === "en-marche").length;
    const pending = orders.filter((o) => o.status !== "terminee").length;
    const urgent = orders.filter((o) => o.priority === "haute" && o.status !== "terminee").length;
    return { running, pending, urgent };
  }, [machines, orders]);

  const addEvent = (actor: TraceEvent["actor"], message: string) => {
    const timestamp = new Date().toLocaleString("fr-FR", {
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    setEvents((prev) => [
      { id: `TR-${prev.length + 1}`, date: timestamp, actor, message },
      ...prev,
    ]);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newOrder.client || !newOrder.part || !newOrder.dueDate) {
      return;
    }

    const id = `CMD-${1050 + orders.length}`;

    setOrders((prev) => [
      ...prev,
      {
        id,
        client: newOrder.client,
        part: newOrder.part,
        quantity: newOrder.quantity,
        dueDate: newOrder.dueDate,
        priority: newOrder.priority,
        status: "nouvelle",
        machineId: null,
      },
    ]);

    addEvent("Client", `Nouvelle commande ${id} créée (${newOrder.part}).`);
    setNewOrder({ client: "", part: "", quantity: 100, dueDate: "", priority: "normale" });
  };

  const planOrder = () => {
    const order = orders.find((item) => item.id === planningOrderId);
    const machine = machines.find((item) => item.id === planningMachineId);

    if (!order || !machine) {
      return;
    }

    setOrders((prev) =>
      prev.map((item) =>
        item.id === planningOrderId
          ? {
              ...item,
              machineId: planningMachineId,
              status: "planifiee",
            }
          : item
      )
    );

    setMachines((prev) =>
      prev.map((item) =>
        item.id === planningMachineId
          ? {
              ...item,
              currentOrder: planningOrderId,
              status: item.status === "maintenance" ? item.status : "en-marche",
            }
          : item
      )
    );

    addEvent("Atelier", `Commande ${planningOrderId} planifiée sur ${machine.name}.`);
  };

  return (
    <main className="container mx-auto px-4 py-8 flex-1 space-y-8">
      <header className="bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold mb-2">Planification Décolletage</h1>
        <p className="text-gray-600">Espace partagé client / atelier pour suivre les commandes, machines en cours et prochaines planifications.</p>

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => setRole("client")}
            className={`px-4 py-2 rounded ${role === "client" ? "bg-primary text-white" : "bg-gray-200"}`}
          >
            Vue Client
          </button>
          <button
            onClick={() => setRole("atelier")}
            className={`px-4 py-2 rounded ${role === "atelier" ? "bg-primary text-white" : "bg-gray-200"}`}
          >
            Vue Atelier
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Machines en marche</p>
          <p className="text-3xl font-bold">{kpi.running}</p>
        </article>
        <article className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Commandes actives</p>
          <p className="text-3xl font-bold">{kpi.pending}</p>
        </article>
        <article className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Priorité haute</p>
          <p className="text-3xl font-bold">{kpi.urgent}</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-xl font-semibold mb-4">État des machines</h2>
          <div className="space-y-3">
            {machines.map((machine) => (
              <div key={machine.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{machine.name}</p>
                  <span className="text-sm px-2 py-1 rounded bg-gray-100">{MACHINE_STATUS_LABELS[machine.status]}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Commande en cours: {machine.currentOrder ?? "Aucune"}</p>
                <p className="text-sm text-gray-600">Prochaine disponibilité: {machine.nextAvailable}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-xl font-semibold mb-4">Commandes</h2>
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{order.id} • {order.part}</p>
                  <span className="text-sm px-2 py-1 rounded bg-gray-100">{STATUS_LABELS[order.status]}</span>
                </div>
                <p className="text-sm text-gray-600">Client: {order.client}</p>
                <p className="text-sm text-gray-600">Qté: {order.quantity} • Livraison: {order.dueDate}</p>
                <p className="text-sm text-gray-600">Machine: {order.machineId ?? "Non planifiée"}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {role === "client" ? (
        <section className="bg-white rounded-xl shadow p-5">
          <h2 className="text-xl font-semibold mb-4">Créer une commande (Client)</h2>
          <form onSubmit={handleCreateOrder} className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              value={newOrder.client}
              onChange={(e) => setNewOrder((prev) => ({ ...prev, client: e.target.value }))}
              placeholder="Nom du client"
              className="border rounded p-2"
              required
            />
            <input
              type="text"
              value={newOrder.part}
              onChange={(e) => setNewOrder((prev) => ({ ...prev, part: e.target.value }))}
              placeholder="Pièce"
              className="border rounded p-2"
              required
            />
            <input
              type="number"
              min={1}
              value={newOrder.quantity}
              onChange={(e) => setNewOrder((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
              className="border rounded p-2"
            />
            <input
              type="date"
              value={newOrder.dueDate}
              onChange={(e) => setNewOrder((prev) => ({ ...prev, dueDate: e.target.value }))}
              className="border rounded p-2"
              required
            />
            <select
              value={newOrder.priority}
              onChange={(e) => setNewOrder((prev) => ({ ...prev, priority: e.target.value as "haute" | "normale" }))}
              className="border rounded p-2"
            >
              <option value="normale">Priorité normale</option>
              <option value="haute">Priorité haute</option>
            </select>
            <button type="submit" className="bg-primary text-white rounded p-2 hover:bg-primary/90">
              Ajouter la commande
            </button>
          </form>
        </section>
      ) : (
        <section className="bg-white rounded-xl shadow p-5">
          <h2 className="text-xl font-semibold mb-4">Planifier une commande (Atelier)</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <select
              value={planningOrderId}
              onChange={(e) => setPlanningOrderId(e.target.value)}
              className="border rounded p-2"
            >
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.id} • {order.part}
                </option>
              ))}
            </select>
            <select
              value={planningMachineId}
              onChange={(e) => setPlanningMachineId(e.target.value)}
              className="border rounded p-2"
            >
              {machines.map((machine) => (
                <option key={machine.id} value={machine.id}>
                  {machine.name}
                </option>
              ))}
            </select>
            <button onClick={planOrder} className="bg-primary text-white rounded p-2 hover:bg-primary/90">
              Planifier
            </button>
          </div>
        </section>
      )}

      <section className="bg-white rounded-xl shadow p-5">
        <h2 className="text-xl font-semibold mb-4">Journal de traçabilité</h2>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {events.map((event) => (
            <div key={event.id} className="border-l-4 border-primary bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">{event.date} • {event.actor}</p>
              <p>{event.message}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

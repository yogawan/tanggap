import type { ExceptionDTO } from "../tools/exception";
import { getException } from "../tools/exception";
import type { ShipmentDTO } from "../tools/shipment";
import { getShipment } from "../tools/shipment";

export type ShipmentContext = {
  shipment: ShipmentDTO;
  exception: ExceptionDTO | null;
};

/** Gathers a shipment + its most recent exception into one object for the LLM prompt (Fase 5). */
export async function buildShipmentContext(
  shipmentNumber: string,
): Promise<ShipmentContext> {
  const shipmentResult = await getShipment.handler({ shipmentNumber });
  if (!shipmentResult.success) {
    throw new Error(shipmentResult.error);
  }

  const exceptionResult = await getException.handler({ shipmentNumber });

  return {
    shipment: shipmentResult.data,
    exception: exceptionResult.success ? exceptionResult.data : null,
  };
}

export function formatShipmentContext(context: ShipmentContext): string {
  const { shipment, exception } = context;
  const lines = [
    `Shipment ${shipment.shipmentNumber} — status: ${shipment.status}, priority: ${shipment.priority}`,
    `Customer: ${shipment.customer.name} (${shipment.customer.phone})`,
    `Route: ${shipment.origin} -> ${shipment.destination}`,
    `ETA: ${shipment.estimatedDelivery.toISOString()}`,
    shipment.vehicle
      ? `Vehicle: ${shipment.vehicle.plateNumber} (${shipment.vehicle.status})`
      : "Vehicle: none assigned",
    shipment.driver
      ? `Driver: ${shipment.driver.name} (${shipment.driver.status})`
      : "Driver: none assigned",
    exception
      ? `Exception: ${exception.type} (${exception.severity}, ${exception.status}) — ${exception.description}`
      : "Exception: none recorded",
  ];
  return lines.join("\n");
}

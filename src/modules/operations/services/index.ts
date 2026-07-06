/**
 * PORT de dados do domínio Operations (M05 compras).
 * Decisões de aprovação NÃO vivem aqui — são do @modules/governance (M06).
 */
import { purchaseFunnel, purchaseOrders, suppliers } from "@/mocks/operacoes";
import type { OrderStatus, PurchaseOrder, Supplier } from "@/types/domain";

export type { OrderStatus, PurchaseOrder, Supplier };

export const getPurchaseFunnel = () => purchaseFunnel;
export const listPurchaseOrders = (): PurchaseOrder[] => purchaseOrders;
export const getPurchaseOrder = (id: string): PurchaseOrder | undefined =>
  purchaseOrders.find((o) => o.id === id);
export const listSuppliers = (): Supplier[] => suppliers;
export const getConcentratedSupplier = (thresholdPct = 40): Supplier | undefined =>
  suppliers.find((s) => s.concentrationPct > thresholdPct);

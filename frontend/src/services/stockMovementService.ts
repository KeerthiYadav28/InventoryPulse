import api from "./api";
import type {
  StockMovement,
  StockMovementType,
} from "../types";

export interface CreateStockMovementData {
  product_id: string;
  type: StockMovementType;
  quantity: number;
  reason?: string;
}

export interface StockMovementFilters {
  product_id?: string;
  type?: StockMovementType;
}

export const getStockMovements = async (
  filters?: StockMovementFilters
): Promise<StockMovement[]> => {
  const response = await api.get<StockMovement[]>(
    "/stock-movements",
    {
      params: filters,
    }
  );

  return response.data;
};

export const getStockMovementById = async (
  id: string
): Promise<StockMovement> => {
  const response = await api.get<StockMovement>(
    `/stock-movements/${id}`
  );

  return response.data;
};

export const createStockMovement = async (
  data: CreateStockMovementData
): Promise<StockMovement> => {
  const response = await api.post<StockMovement>(
    "/stock-movements",
    data
  );

  return response.data;
};
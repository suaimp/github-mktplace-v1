export interface OrderTableData {
  id: string;
  status: string;
  urls: string[];
  created_at: string;
}

export interface OrderTableRowProps {
  item: OrderTableData;
}

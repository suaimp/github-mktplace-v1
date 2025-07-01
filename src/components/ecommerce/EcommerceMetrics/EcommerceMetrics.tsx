import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../../icons";
import Badge from "../../ui/badge/Badge";
import { useEffect, useState } from "react";
import { getOrdersCount } from "../../../services/db-services/marketplace-services/order/OrderService";
import { calculateOrderGrowth } from "./actions/calculateOrderGrowth";
import Tooltip from "../../ui/Tooltip";
import { getPlatformUsersCount } from "../../../services/db-services/user/platformUsersService";
import { calculatePlatformUserGrowth } from "./actions/calculatePlatformUserGrowth";

export default function EcommerceMetrics() {
  const [ordersCount, setOrdersCount] = useState<number | null>(null);
  const [orderGrowth, setOrderGrowth] = useState<{ percent: number; current: number; previous: number } | null>(null);
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [userGrowth, setUserGrowth] = useState<{ percent: number; current: number; previous: number } | null>(null);

  useEffect(() => {
    async function fetchOrdersCount() {
      const count = await getOrdersCount();
      setOrdersCount(count);
      const growth = await calculateOrderGrowth();
      setOrderGrowth(growth);
      // Clientes
      const users = await getPlatformUsersCount();
      setUsersCount(users);
      const userGrowthData = await calculatePlatformUserGrowth();
      setUserGrowth(userGrowthData);
    }
    fetchOrdersCount();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Clientes
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {usersCount !== null ? usersCount.toLocaleString("pt-BR") : "..."}
            </h4>
          </div>
          <Badge color={userGrowth && userGrowth.percent >= 0 ? "success" : "error"}>
            {userGrowth ? (
              <>
                {userGrowth.percent >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                {Math.abs(userGrowth.percent).toFixed(2)}%
              </>
            ) : (
              "..."
            )}
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              Pedidos
              <Tooltip content="Quantidade total de pedidos realizados neste mês. A variação indica o crescimento ou queda em relação ao mês anterior.">
                <span className="ml-1 text-gray-400">&#9432;</span>
              </Tooltip>
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {ordersCount !== null ? ordersCount.toLocaleString("pt-BR") : "..."}
            </h4>
          </div>
          <Badge color={orderGrowth && orderGrowth.percent >= 0 ? "success" : "error"}>
            {orderGrowth ? (
              <>
                {orderGrowth.percent >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                {Math.abs(orderGrowth.percent).toFixed(2)}%
              </>
            ) : (
              "..."
            )}
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
}

import { notification } from "antd";
import _ from "lodash";
import { useCallback, useEffect, useState } from "react";

const months = [1, 6, 12];
const NOTIFICATION_TIME = 15 * 60 * 1000;

export const SaleNotification = () => {
  const [api, contextHolder] = notification.useNotification();
  const [timer, setTimer] = useState(0);

  const openNotification = useCallback(() => {
    const randomMonth = _.sample(months);
    api.info({
      message: "Thông báo",
      placement: "bottomLeft",
      description: `Một khách hàng đã đăng kí VIP ${randomMonth} tháng`,
    });
  }, [api]);

  useEffect(() => {
    setTimer(NOTIFICATION_TIME);
    setInterval(() => {
      openNotification();
      setTimer(NOTIFICATION_TIME);
    }, NOTIFICATION_TIME);
  }, [openNotification]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {}, [timer]);

  return <>{contextHolder}</>;
};

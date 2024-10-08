import classes from "./order-card.module.css";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { formatPrice } from "../../utils/format-price";

export const W3OrderCard = ({ data }) => {
  const addonsPrice =
    data?.addons?.reduce((acc, item) => acc + item.total_price, 0) || 0;

  return (
    <div className={classes.card}>
      <div className={classes.cardMain}>
        <Typography variant="subtitle2" fontWeight={500}>
          {data.translation?.title}
        </Typography>
        <Stack
          direction="row"
          alignItems="center"
          width="40%"
          justifyContent="space-between"
        >
          <Typography variant="caption" color="gray">
            {data.stock.amount}x
          </Typography>
          <Typography variant="subtitle1" fontWeight={700}>
            {formatPrice(data.stock?.total_price + addonsPrice)}
          </Typography>
        </Stack>
      </div>
      <Stack>
        {data?.addons?.map((addon) => (
          <Typography key={addon.id} variant="caption" color="gray">
            {addon.translation?.title || addon.stock.product.translation?.title}{" "}
            x {addon.quantity}
          </Typography>
        ))}
      </Stack>
    </div>
  );
};

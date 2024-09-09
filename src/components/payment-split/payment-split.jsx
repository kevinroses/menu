import classes from "./payment-split.module.css";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import UserLineIcon from "remixicon-react/UserLineIcon";
import AddLineIcon from "remixicon-react/AddLineIcon";
import SubtractLineIcon from "remixicon-react/SubtractLineIcon";
import { useState } from "react";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import { formatPrice } from "../../utils/format-price.js";
import { useSettings } from "../../context/settings/provider.jsx";
import LoadingIcon from "../../assets/icons/loading.jsx";
import { fetcher } from "../../utils/fetcher.js";

function PaymentSplit({
  order,
  onSplitConfirm,
  onSplitCancel,
  isLoading,
  splitPaymentLinks,
}) {
  const { settings } = useSettings();
  const minSplit = settings.split_min || 1;
  const maxSplit = settings.split_max || 1;

  const [peopleCount, setPeopleCount] = useState(minSplit);

  const handleSplitConfirm = () => {
    onSplitConfirm(peopleCount);
  };

  return (
    <Container maxWidth="sm" className={classes.container}>
      {isLoading && (
        <div className={classes.loadingBox}>
          <Stack my={10} alignItems="center">
            <LoadingIcon size={40} />
          </Stack>
        </div>
      )}
      <Stack spacing={1} px={1}>
        <Typography
          px={2}
          variant="subtitle1"
          fontSize={18}
          fontWeight={600}
          mb={1.5}
        >
          Divide the payment equally
        </Typography>
        <div className={classes.counterWrapper}>
          <div className={classes.label}>
            <UserLineIcon />
            <Typography>Total people in your table</Typography>
          </div>

          <div className={classes.counter}>
            <IconButton
              size="small"
              onClick={() => setPeopleCount(peopleCount - 1)}
              disabled={peopleCount <= minSplit}
            >
              <SubtractLineIcon />
            </IconButton>
            <Typography variant="h6">{peopleCount}</Typography>
            <IconButton
              size="small"
              onClick={() => setPeopleCount(peopleCount + 1)}
              disabled={peopleCount >= maxSplit}
            >
              <AddLineIcon />
            </IconButton>
          </div>
        </div>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        padding="0 .4rem"
      >
        <Typography fontWeight={500}>Total amount</Typography>
        <Typography fontWeight={500}>
          {formatPrice(order?.total_price)}
        </Typography>
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        padding="0 .4rem"
      >
        <Typography>Amount per person</Typography>
        <Typography fontWeight={500}>
          {formatPrice(order?.total_price / peopleCount)}
        </Typography>
      </Stack>
      {/*<SplitPaymentButtons*/}
      {/*  splitPaymentLinks={splitPaymentLinks}*/}
      {/*  renderItem={(props, splitLink, idx) => (*/}
      {/*    <Button key={splitLink.id} {...props}>*/}
      {/*      Person {idx + 1}*/}
      {/*    </Button>*/}
      {/*  )}*/}
      {/*/>*/}
      {splitPaymentLinks.length > 1 ? (
        <SplitPaymentButtons
          splitPaymentLinks={splitPaymentLinks}
          renderItem={(props, splitLink, idx) => (
            <Button key={splitLink.id} {...props}>
              Person {idx + 1}
            </Button>
          )}
        />
      ) : (
        <Stack padding="0 .4rem">
          <div className={classes.btnWrapper}>
            <Button
              fullWidth
              size="large"
              color="error"
              variant="outlined"
              onClick={onSplitCancel}
            >
              Remove split
            </Button>
            <Button
              onClick={handleSplitConfirm}
              fullWidth
              variant="contained"
              size="large"
            >
              Confirm
            </Button>
          </div>
        </Stack>
      )}
    </Container>
  );
}

export function SplitPaymentButtons({
  splitPaymentLinks = [],
  renderItem,
  transactionChildren,
}) {
  const handleClick = (splitLink) => {
    // fetcher(`v1/rest/orders/clicked/${splitLink.id}`).finally(() => {
    window.location.replace(splitLink.data?.url);
    // });
  };

  const paidTransactions =
    transactionChildren.filter(
      (transaction) => transaction.status === "paid",
    ) || [];

  return (
    <div className={classes.splitBtns}>
      {splitPaymentLinks.map(
        (splitLink, idx) =>
          renderItem &&
          renderItem(
            {
              variant: "contained",
              className: classes.splitBtn,
              onClick: () => handleClick(splitLink),
              disabled: paidTransactions.some(
                (transaction) => transaction?.payment_trx_id === splitLink?.id,
              ),
            },
            splitLink,
            idx,
          ),
      )}
    </div>
  );
}

export default PaymentSplit;

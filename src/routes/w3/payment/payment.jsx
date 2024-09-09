import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { Container } from "@mui/material";
import { formatPrice } from "../../../utils/format-price";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetcher } from "../../../utils/fetcher";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import LoadingIcon from "../../../assets/icons/loading";
import { W2Header } from "../../../components/w2-header";
import orderClasses from "../order/order.module.css";
import classes from "./payment.module.css";
import { W3OrderCard } from "../../../components/w3-order-card";
import { W2Button } from "../../../components/w2-button";
import MoneyIcon from "../../../assets/icons/money";
import { useEffect, useState } from "react";
import { BottomSheet } from "react-spring-bottom-sheet";
import { ReviewForm } from "../../../components/review-form";
import { createReviewRequest } from "../../../services/review";
import { useSettings } from "../../../context/settings/provider.jsx";
import Button from "@mui/material/Button";
import { SplitPaymentButtons } from "../../../components/payment-split/payment-split.jsx";
import { PaymentBox } from "../../../components/payment-box/payment-box.jsx";

const tips = [20, 15, 10, 5, 0];

const W2Payment = () => {
  const [params] = useSearchParams();
  const { search } = useLocation();
  const navigate = useNavigate();

  const { settings } = useSettings();
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [isListeningOrder, setIsListeningOrder] = useState(true);
  const [userClosedPayment, setUserClosedPayment] = useState(false);
  const { data: order, isLoading: isOrderLoading } = useQuery(
    ["orderlist"],
    () =>
      fetcher(`v1/rest/orders/table/${params.get("table_id")}`).then((res) =>
        res.json(),
      ),
    {
      refetchOnWindowFocus: true,
      refetchInterval: 2000,
      staleTime: 0,
      enabled: isListeningOrder,
      onSuccess: (data) => {
        console.log("status =>", data?.data?.status);
        if (data.data === null) return setIsListeningOrder(false);
        if (
          sessionStorage.getItem("selected-method") !== "cash" &&
          (data?.data?.status === "delivered" ||
            settings.order_payment === "before")
        ) {
          handlePaymentOpen();
        }
      },
    },
  );

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSnackbarVisible, setIsSnackbarVisible] = useState({
    review: false,
    payment: false,
  });
  // const { mutate: processOrder } = useMutation({
  //   mutationFn: ({ type, order_id }) =>
  //     fetcher(`v1/rest/order-${type}-process`, { order_id }),
  // });

  const [selectedTip, setSelectedTip] = useState(null);
  const [customTip, setCustomTip] = useState();
  // const { data: order, isFetching: isOrderLoading } = useQuery(
  //   ["orderlist"],
  //   () =>
  //     fetcher(`v1/rest/orders/table/${params.get("table_id")}`).then((res) =>
  //       res.json()
  //     )
  // );

  const {
    mutate: writeReview,
    isLoading: writeReviewLoading,
    isSuccess: isReviewSuccess,
    isError: isReviewError,
  } = useMutation({
    mutationFn: (data) => createReviewRequest(order?.data.id, data),
    onSuccess: () => {
      setIsReviewModalOpen(false);
      handleSnackBar("review", true);
    },
  });
  // const calculatedTip =
  //   ((order?.data?.total_price || 1) * (selectedTip === 0 ? 1 : selectedTip)) /
  //     100 || 0 + (customTip ? Number(customTip) : 0);
  const actualTipAmount =
    (order?.data?.total_price / 100) * selectedTip || Number(customTip) || 0;

  const handleSnackBar = (type, value) => {
    setIsSnackbarVisible((old) => ({ ...old, [type]: value }));
  };

  const orderDelivered = order?.data?.status === "delivered";
  const orderPaid = order?.data?.transaction?.status === "paid";
  const total_items = order?.data?.details?.reduce(
    (acc, curr) => acc + curr.quantity,
    0,
  );
  const total_price = order?.data?.total_price;
  const paymentSplitted = order?.data?.payment_processes?.length > 0;
  const isPayBtnVisible =
    (settings.order_payment === "after" &&
      order?.data?.status === "delivered" &&
      !paymentSplitted) ||
    (settings.order_payment === "before" &&
      !(order?.data?.transaction?.status === "paid") &&
      !paymentSplitted);

  const isPaymentBoxVisible =
    paymentVisible && !userClosedPayment && !orderPaid;

  const handlePaymentOpen = (openedByUser) => {
    setPaymentVisible(true);
    if (openedByUser) setUserClosedPayment(false);
  };

  const handlePaymentClose = (closedByUser) => {
    setPaymentVisible(false);
    if (closedByUser) setUserClosedPayment(true);
  };

  useEffect(() => {
    if (paymentSplitted) {
      setUserClosedPayment(true);
    }
  }, [params, paymentSplitted]);

  if (isOrderLoading) {
    return (
      <>
        <W2Header type="w3" />
        <Stack my={10} alignItems="center">
          <LoadingIcon size={40} />
        </Stack>
      </>
    );
  }

  if (!order?.data) {
    return (
      <>
        <W2Header type="w3" />
        <Container maxWidth="sm">
          <Typography variant="h5" textAlign="center">
            There is nothing to see
          </Typography>
        </Container>
      </>
    );
  }

  console.log("isPaymentBoxVisible", isPaymentBoxVisible);

  return (
    <div className={`${classes.container}`}>
      <BottomSheet
        open={isPaymentBoxVisible}
        onDismiss={() => handlePaymentClose(true)}
      >
        <PaymentBox
          tipAmount={actualTipAmount}
          onSuccess={handlePaymentClose}
          order={order?.data}
        />
      </BottomSheet>
      {isReviewSuccess && (
        <Snackbar
          anchorOrigin={{ horizontal: "center", vertical: "top" }}
          open={isSnackbarVisible.review}
          autoHideDuration={100}
        >
          <Alert
            severity="success"
            onClose={() => handleSnackBar("review", false)}
            sx={{ width: "100%" }}
          >
            Review succesfully created
          </Alert>
        </Snackbar>
      )}
      {isReviewError && (
        <Snackbar
          anchorOrigin={{ horizontal: "center", vertical: "top" }}
          open={isSnackbarVisible.review}
          autoHideDuration={100}
        >
          <Alert
            severity="error"
            onClose={() => handleSnackBar("payment", false)}
            sx={{ width: "100%" }}
          >
            Create review failed
          </Alert>
        </Snackbar>
      )}
      <Container maxWidth="sm">
        <W2Header type="w3" />
        <Stack px={2} my={4}>
          <Typography fontWeight={600} variant="subtitle2">
            Table: {order?.data.table?.name}
          </Typography>
          <Typography fontWeight={600} color="gray" variant="subtitle2">
            Order opened:{" "}
            {new Date(order?.data.created_at).toLocaleDateString()}{" "}
            {new Date(order?.data.created_at).toLocaleTimeString()}
          </Typography>
          <Typography fontWeight={600} color="gray" variant="subtitle2">
            Order: {order?.data.id}
          </Typography>
        </Stack>
        {order?.data.waiter && (
          <div className={classes.waiter}>
            <img
              src={order?.data.waiter.img}
              alt={order?.data.waiter.firstname}
              className={classes.waiterImage}
            />
            <Stack>
              <Typography variant="subtitle1">
                {order?.data.waiter.firstname}
              </Typography>
              <Typography variant="caption">Waiter</Typography>
            </Stack>
          </div>
        )}
        <Stack px={2} mb={4} gap="10px" direction="row" alignItems="center">
          <W2Button
            onClick={() => navigate({ pathname: "/w3/menu", search })}
            variant="blackBtn"
          >
            Menu
          </W2Button>
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className={classes.blackBtn}
          >
            <span className={classes.text}>Review</span>
          </button>
        </Stack>
        <div className={orderClasses.reciept}>
          <div className={orderClasses.recieptContent}>
            {order?.data?.details?.map((detail) => {
              return (
                <W3OrderCard
                  key={detail.id}
                  disabled
                  inPaymentPage
                  data={{
                    ...detail.stock.product,
                    stock: {
                      amount: detail.quantity,
                      total_price: detail.total_price,
                      price: detail.stock.price,
                      discount: detail.stock.discount,
                    },
                    addons: detail.addons,
                  }}
                />
              );
            })}
          </div>
        </div>
        {orderDelivered && (
          <div className={orderClasses.reciept} style={{ margin: "2rem 0" }}>
            <Stack px={2} spacing="1.25rem">
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <div className={classes.moneyWrapper}>
                  <MoneyIcon />
                </div>

                <Typography variant="subtitle1" fontWeight={600}>
                  Хотите оставить чаевые?
                </Typography>
              </Stack>
              <input
                type="number"
                className={classes.moneyInput}
                onFocus={() => setSelectedTip(null)}
                placeholder="Ввести сумму"
                value={!customTip && customTip !== 0 ? "" : customTip}
                onChange={(e) => setCustomTip(e.target.value)}
                min={0}
              />
              <Stack
                alignItems="center"
                flexDirection="row"
                justifyContent="space-between"
              >
                {tips.map((tip) => (
                  <button
                    onClick={() => {
                      setSelectedTip(tip);
                      setCustomTip(undefined);
                    }}
                    className={`${classes.tip} ${
                      tip === selectedTip ? classes.active : ""
                    }`}
                    key={tip}
                  >
                    {tip === 0 ? "No" : `%${tip}`}
                  </button>
                ))}
              </Stack>
            </Stack>
          </div>
        )}
      </Container>

      <div
        className={`${orderClasses.reciept}`}
        style={{ margin: "2rem 0", padding: "1rem" }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="subtitle1" fontWeight={500}>
            Total items
          </Typography>
          <Typography variant="subtitle1" fontWeight={500}>
            {total_items}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="subtitle1" fontWeight={500}>
            Service fee
          </Typography>
          <Typography variant="subtitle1" fontWeight={500}>
            {formatPrice(order?.data?.service_fee)}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="subtitle1" fontWeight={500}>
            Tax
          </Typography>
          <Typography variant="subtitle1" fontWeight={500}>
            {formatPrice(order?.data?.tax)}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="subtitle1" fontWeight={500}>
            Tip
          </Typography>
          <Typography variant="subtitle1" fontWeight={500}>
            {formatPrice(actualTipAmount)}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="subtitle1" fontWeight={500}>
            Total amount
          </Typography>
          <Typography variant="subtitle1" fontWeight={500}>
            {formatPrice(total_price + actualTipAmount)}
          </Typography>
        </Stack>
      </div>
      {paymentSplitted && !orderPaid && (
        <SplitPaymentButtons
          splitPaymentLinks={order?.data?.payment_processes}
          transactionChildren={order?.data?.transaction?.children || []}
          renderItem={(props, splitLink, idx) => (
            <Button key={splitLink.id} {...props}>
              Person {idx + 1}
            </Button>
          )}
        />
      )}
      {isPayBtnVisible && !orderPaid && (
        <Stack>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => handlePaymentOpen(true)}
          >
            Pay now
          </Button>
        </Stack>
      )}
      <BottomSheet
        open={isReviewModalOpen}
        onDismiss={() => setIsReviewModalOpen(false)}
      >
        <ReviewForm
          onSubmit={(data) => writeReview(data)}
          loading={writeReviewLoading}
        />
      </BottomSheet>
      <div style={{height: "1rem"}}/>
    </div>
  );
};

export default W2Payment;

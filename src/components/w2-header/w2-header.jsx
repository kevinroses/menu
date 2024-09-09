import ChevronLeft from "../../assets/icons/chevron-left";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import classes from "./w2-header.module.css";
import PhoneOutlined from "../../assets/icons/phone-outlined";
import Magnifier from "../../assets/icons/magnifier";
import { useNavigate } from "react-router-dom";
import ProductSearchInput from "../product-search-input";
import { useLayoutEffect, useState } from "react";

export const W2Header = ({ onSearchChange }) => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useLayoutEffect(() => {
    const currentUrl = new URL(window.location.href);
    const historyHasStripeCheckout =
      currentUrl.searchParams.get("redirect_from") === "stripe";
    if (historyHasStripeCheckout) {
      const uiType = currentUrl.pathname.includes("w3") ? "w3" : "w2";
      currentUrl.searchParams.delete("redirect_from");
      navigate(`/${uiType}` + currentUrl.search, { replace: true });
    }
  }, []);

  return (
    <div className={classes.wrapper}>
      <Container maxWidth="sm" className={classes.container}>
        {isSearchOpen ? (
          <ProductSearchInput
            onChange={onSearchChange}
            handleClose={() => {
              onSearchChange("");
              setIsSearchOpen(false);
            }}
          />
        ) : (
          <>
            <button onClick={() => navigate(-1)} className={classes.button}>
              <ChevronLeft />
              Back
            </button>
            <div className={classes.actions}>
              <IconButton>
                <PhoneOutlined />
              </IconButton>

              {onSearchChange && ( // Check if setSearchTerm is passed that means it's a search page
                <IconButton
                  // onClick={() =>
                  //   navigate({ pathname: `/${type}/search`, search })
                  // }
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Magnifier />
                </IconButton>
              )}
            </div>
          </>
        )}
      </Container>
    </div>
  );
};

export default W2Header;

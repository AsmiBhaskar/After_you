import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { motion } from "framer-motion";

const LoadingScreen = ({ message = "Loading…" }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #FAFBFF 0%, #F0F2FF 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <Box sx={{ textAlign: "center" }}>
          {/* Brand */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.02em",
                mb: 2.5,
                background: "linear-gradient(45deg, #6B73FF 30%, #FF6B9D 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              AfterYou
            </Typography>
          </motion.div>

          {/* Spinner */}
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <CircularProgress
              size={42}
              thickness={4}
              sx={{
                color: "#6B73FF",
                mb: 2,
              }}
            />
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontWeight: 500,
                letterSpacing: "0.01em",
              }}
            >
              {message}
            </Typography>
          </motion.div>
        </Box>
      </motion.div>
    </Box>
  );
};

export default LoadingScreen;

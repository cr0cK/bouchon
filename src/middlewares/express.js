export const errorMiddleware = (err, req, res, next) => {
  if (err.isBoom) {
    const payload = {
      ...err.output.payload,
      message: err.message,
    };

    if (err.data) {
      payload.data = err.data;
    }

    return res.status(err.output.statusCode)
              .send(payload);
  }

  return next(err);
};

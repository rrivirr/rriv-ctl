export const errorHandler = (error: any) => {
  const errorResponse = error?.response?.data;
  if (errorResponse) {
    console.log(
      `\nApiError:`,
      errorResponse?.error_description || errorResponse.message || errorResponse
    );
    process.exit(1);
  }
  if (error.message === "(outputHelp)") {
    process.exit(0);
  } else {
    console.log(`\nError: ${error?.message}`);
    process.exit(1);
  }
};

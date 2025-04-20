export const errorHandler = (body: { error: any; exit: boolean }) => {
  const { error, exit } = body;
  const errorResponse = error?.response?.data;
  if (errorResponse) {
    console.log(
      `\nApiError:`,
      errorResponse?.error_description || errorResponse.message || errorResponse
    );
  }
  if (error.message === "(outputHelp)") {
    exit && process.exit(0);
  } else if (error.errors) {
    console.log(`${error.errors}`);
  } else {
    console.log(`\nError: ${error?.message}`);
  }
  exit && process.exit(1);
};

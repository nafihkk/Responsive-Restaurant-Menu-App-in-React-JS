import apiClient from "./client";

const FALLBACK_BRANCH_ID = "4e33f1b6-6c55-44b4-a209-19039d371225";

export const getProductList = async () => {
  const branchId =
    process.env.REACT_APP_BRANCH_ID?.trim() || FALLBACK_BRANCH_ID;

  const response = await apiClient.get(
    "/api/Product/GetAllByBranch",
    {
      params: { globalBranchID: branchId },
    }
  );

  return response.data;
};


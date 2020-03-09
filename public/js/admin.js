const deleteProduct = async btn => {
  const prodId = btn.parentNode.querySelector("[name=productId]").value;
  const csrfToken = btn.parentNode.querySelector("[name=_csrf]").value;
  const producetElement = btn.closest("article");
  const url = `/admin/product/${prodId}`;
  try {
    await axios.delete(url, { headers: { "csrf-token": csrfToken } });
    producetElement.remove();
  } catch (error) {
    console.log(error);
  }
};

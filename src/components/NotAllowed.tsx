function NotAllowed({ tabId = "" }) {
  return (
    <div className="bg-red-100 text-red-800 p-4 text-center">
      ❗ Only one tab is allowed at a time - {tabId}
    </div>
  );
}

export default NotAllowed;

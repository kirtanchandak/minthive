function AppBar() {
  return (
    <>
      <div className="flex justify-between py-3 px-12 border-b">
        <a href="/">
          <p className="text-2xl font-bold">Worker minthive 🪙</p>
        </a>
        <div>
          <p className="text-2xl">Connect Wallet</p>
        </div>
      </div>
    </>
  );
}

export default AppBar;

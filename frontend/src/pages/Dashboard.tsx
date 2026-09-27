import StatCard from "../components/StatCard";

const Dashboard = () => {
  return (
    <div>
      <header>
        <h2>Dashboard</h2>

        <p>
          Overview of your inventory system.
        </p>
      </header>

      <section>
        <h3>Inventory Overview</h3>

        <div className="dashboard-stats">
          <StatCard
            title="Total Products"
            value={0}
          />

          <StatCard
            title="Total Categories"
            value={0}
          />

          <StatCard
            title="Total Suppliers"
            value={0}
          />

          <StatCard
            title="Low Stock Items"
            value={0}
          />
        </div>
      </section>

      <section>
        <h3>Recent Stock Movements</h3>

        <p>
          Recent stock movements will appear here.
        </p>
      </section>

      <section>
        <h3>Low Stock Products</h3>

        <p>
          Low stock products will appear here.
        </p>
      </section>
    </div>
  );
};

export default Dashboard;
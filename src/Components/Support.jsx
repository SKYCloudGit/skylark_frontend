import React from 'react';
import { Card } from 'react-bootstrap';

const Support = () => {
  return (
    <div className="container my-4">
      <h1 className="mb-4 text-center">📖 Smart Water Meter Web App – User Guide</h1>

      {/* Getting Started & Security */}
      <Card className="mb-4 p-3 shadow-sm">
        <h2>Getting Started & Security</h2>
        <p>
          Welcome to the Smart Water Meter web application! Your session is authenticated using a
          <strong>bearer token</strong> which is valid for a secure period of{' '}
          <strong>30 minutes</strong>. For your protection, you will be automatically logged out
          after this time. If you need to continue working, simply log back in to receive a new
          token.
        </p>
      </Card>

      {/* Access Control & Roles */}
      <Card className="mb-4 p-3 shadow-sm">
        <h2>Access Control & Roles</h2>
        <p>
          The application controls what you can see and do based on your assigned user role. The
          navigation sidebar will <strong>only show the modules</strong> that are relevant to your
          permissions.
        </p>
        <ul>
          <li>
            <strong>Super Admin:</strong> Has full access to all features, including the ability to
            manage all users and roles.
          </li>
          <li>
            <strong>Admin:</strong> Manages users and permissions within their assigned scope.
          </li>
          <li>
            <strong>Distributor:</strong> Has access to modules relevant to distributing water
            meters and managing consumer accounts.
          </li>
          <li>
            <strong>Manufacturer:</strong> Has specific access to tools for managing inventory and
            quality control.
          </li>
        </ul>
        <p>
          Within each module, specific buttons and actions (e.g., "Delete," "Update," "Configure")
          may be <strong>enabled or disabled based on your `auth ID` and permissions.</strong> This
          ensures you can only perform actions you are authorized to.
        </p>
      </Card>

      {/* Dashboard Section */}
      <Card className="mb-4 p-3 shadow-sm">
        <h2>📊 Dashboard</h2>
        <p>
          The Dashboard is your command center. It provides a real-time overview of the entire
          system, including key metrics, recent data activity, and system health indicators. Use it
          to quickly check the overall status of your network before diving into specific modules.
        </p>
      </Card>

      {/* Area Management - Elaborated */}
      <Card className="mb-4 p-3 shadow-sm">
        <h2>🌍 Area Management</h2>
        <p>
          This module is used to organize your water distribution network into a clear, geographical
          hierarchy. This two-part process involves first defining the levels of your hierarchy, and
          then adding data to those levels.
        </p>

        <h3>
          <strong>Hierarchy Titles</strong>
        </h3>
        <p>
          This is where you **define the labels or categories for your network's structure**. For
          example, you might define titles such as "State," "Zone," "Circle," and "Area." These
          titles establish the different levels you will use to organize your data later.
        </p>

        <h3>
          <strong>Add Hierarchy</strong>
        </h3>
        <p>
          Once your hierarchy titles are set, this is where you **add the actual data** to each
          level. This creates the specific nested structure of your network.
        </p>
        <p>
          <strong>Step-by-step example:</strong>
          <ol>
            <li>
              Select the **Parent Hierarchy** from the dropdown (e.g., if you are adding a State,
              the parent might be the Country).
            </li>
            <li>Select the **Hierarchy Title** you wish to add (e.g., "State").</li>
            <li>Enter the **data** for that title (e.g., "Maharashtra").</li>
            <li>
              This action will create a new item under the parent, making it ready for you to add
              the next level of data beneath it (e.g., adding a "Zone" under "Maharashtra").
            </li>
          </ol>
        </p>

        <h3>
          <strong>Manage Hierarchy Items</strong>
        </h3>
        <ul>
          <li>
            <strong>Edit:</strong> To update a hierarchy item's name or reassign it, find the item
            and click the "Edit" button.
          </li>
          <li>
            <strong>Delete:</strong> To remove an item, click the "Delete" button. **Note:**
            Deleting a parent hierarchy will also delete all of its child hierarchies. The system
            will ask for confirmation before proceeding.
          </li>
        </ul>
      </Card>

      {/* Meter Management */}
      <Card className="mb-4 p-3 shadow-sm">
        <h2>💧 Meter Management</h2>
        <p>
          This module is the core of your application, where you handle all activities related to
          water meters.
        </p>
        <ul>
          <li>
            <strong>All Meters:</strong> View and search all meters in the system. You can also
            **manually add a meter** here in case of any issues with automated data entry.
          </li>
          <li>
            <strong>Meter Mapping:</strong> Assign meters to consumers by selecting the appropriate
            hierarchy levels and addresses.
          </li>
          <li>
            <strong>Meter Configuration:</strong> Send specific **topics or commands** to a meter
            remotely, allowing you to change settings like its internal clock, time, or other
            technical parameters.
          </li>
          <li>
            <strong>Area Wise Meters:</strong> This page is specifically designed for{' '}
            <strong>Distributors</strong>. It allows them to monitor all the meters within the
            geographical area that has been assigned to them.
          </li>
        </ul>
      </Card>

      {/* User Management */}
      <Card className="mb-4 p-3 shadow-sm">
        <h2>👥 User Management</h2>
        <p>
          This module is primarily for <strong>Admins</strong> and <strong>Super Admins</strong> to
          manage system users and their permissions.
        </p>
        <ul>
          <li>
            <strong>User List:</strong> View a list of all registered users. From here, you can:
            <ul>
              <li>Update user details (e.g., name, contact info).</li>
              <li>Toggle a user's status to enable or disable their account.</li>
              <li>Delete a user from the system.</li>
              <li>Assign a specific area to a user.</li>
              <li>Change a user's role.</li>
              <li>Reset a user's password.</li>
            </ul>
          </li>
          <li>
            <strong>Assign Modules:</strong> This is where you grant users access to different
            sections of the application.
            <ul>
              <li>
                You only need to assign the **parent module**. Upon assignment, a dropdown will
                appear with operations like **Read, Write, Delete, and Update**. You can select the
                appropriate access level.
              </li>
              <li>
                After the parent module is assigned, the related **child module dropdowns** will
                automatically appear, allowing for more granular permission settings.
              </li>
            </ul>
          </li>
        </ul>
      </Card>

      {/* BCS Tool */}
      <Card className="mb-4 p-3 shadow-sm">
        <h2>🛠️ BCS Tool (Manufacturer Only)</h2>
        <p>
          The BCS (Backend Consumption System) Tool is a specialized module for{' '}
          <strong>Manufacturers only</strong>. Its primary purpose is to help manage meter inventory
          and quality control.
        </p>
        <ul>
          <li>
            <strong>Inventory Follow-up:</strong> Track the status and location of manufactured
            meters.
          </li>
          <li>
            <strong>Pass/Fail Scenarios:</strong> Cross-check raw meter data to perform quality
            assurance and determine if a meter passes or fails its operational tests.
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default Support;

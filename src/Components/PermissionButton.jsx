import PropTypes from "prop-types";

const PermissionButton = ({ moduleId, action, permissionsMap, children, ...props }) => {
  const permission = permissionsMap?.[moduleId];
  if (!permission || !permission[action]) return null;

  return <button {...props}>{children}</button>;
};

PermissionButton.propTypes = {
  moduleId: PropTypes.string.isRequired,
  action: PropTypes.oneOf(["read", "write", "update", "delete"]).isRequired,
  permissionsMap: PropTypes.object,
  children: PropTypes.node,
};

export default PermissionButton;

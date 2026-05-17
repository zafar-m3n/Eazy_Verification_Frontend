import { toast } from "react-toastify";

function success(message) {
  toast.success(message);
}

function error(message) {
  toast.error(message);
}

function warning(message) {
  toast.warning(message);
}

const Notification = {
  success,
  error,
  warning,
};

export default Notification;

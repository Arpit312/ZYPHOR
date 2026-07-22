import clsx from "clsx";

export default function Container({ children, className }) {
  return <div className={clsx("container-x", className)}>{children}</div>;
}

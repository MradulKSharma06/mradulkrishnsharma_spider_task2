export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-400 text-center py-4 text-sm mt-auto">
      © {new Date().getFullYear()} BillSplit · All rights reserved.
    </footer>
  );
}

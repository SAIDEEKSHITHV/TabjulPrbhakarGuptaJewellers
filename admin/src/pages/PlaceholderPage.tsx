import { useLocation } from 'react-router';
import AdminLayout from '../components/layout/AdminLayout';

export default function PlaceholderPage() {
  const location = useLocation();
  const path = location.pathname;

  let title = 'Settings';
  let description = 'System configurations and access keys.';

  if (path.startsWith('/products/new')) {
    title = 'Add New Product';
    description = 'Add jewelry metadata, custom translations, and images.';
  } else if (path.includes('/edit')) {
    title = 'Edit Product';
    description = 'Update jewelry details and modify image order.';
  } else if (path.startsWith('/products')) {
    title = 'Jewelry Products';
    description = 'Manage jewelry listings, edit metadata, and publish catalog items.';
  } else if (path.startsWith('/collections')) {
    title = 'Collections & Categories';
    description = 'Define categories such as bridal, gold, or diamond.';
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-[#F5EFE7] text-2xl md:text-3xl font-medium tracking-wide">
            {title}
          </h1>
          <p className="text-xs md:text-sm text-[#B8B0A8] mt-1.5 font-light leading-relaxed">
            {description}
          </p>
        </div>

        <div className="border border-[rgba(201,162,74,0.15)] bg-[#131315]/30 p-8 text-center max-w-xl">
          <p className="text-xs md:text-sm text-[#B8B0A8] leading-relaxed font-light">
            The database schemas, trigger operations, and RLS guidelines for this catalog module are already fully configured.
            The dynamic CRUD interfaces, reordering, and Cloudinary upload controllers will be mapped here in later phases.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Card, { StatsCard } from '../components/common/Card';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';

describe('Common components', () => {
  it('renders Card with title and children', () => {
    render(
      <Card title="Hello">
        <span>Body</span>
      </Card>
    );

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('renders StatsCard trend indicator', () => {
    render(<StatsCard title="Revenue" value="$100" subtitle="This month" trend={{ value: 5, isPositive: true }} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText(/↑ 5%/)).toBeInTheDocument();
  });

  it('Table shows loading and empty states', () => {
    const columns = [{ key: 'name', header: 'Name', render: (row: any) => row.name }];
    const { rerender } = render(<Table columns={columns} data={[]} loading />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    rerender(<Table columns={columns} data={[]} loading={false} emptyMessage="Nothing here" />);
    expect(screen.getByText(/Nothing here/i)).toBeInTheDocument();
  });

  it('Table renders rows and handles sort click', async () => {
    const onSort = vi.fn();
    const columns = [
      { key: 'name', header: 'Name', render: (row: any) => row.name, sortable: true },
      { key: 'value', header: 'Value', render: (row: any) => row.value }
    ];
    render(<Table columns={columns} data={[{ id: 1, name: 'Row 1', value: 'A' }]} onSort={onSort} sortKey="name" sortDirection="asc" />);

    expect(screen.getByText('Row 1')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Name'));
    expect(onSort).toHaveBeenCalledWith('name', 'desc');
  });

  it('Pagination renders ranges and triggers page changes', async () => {
    const onPageChange = vi.fn();
    const onItemsPerPageChange = vi.fn();
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        totalItems={42}
        itemsPerPage={10}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
      />
    );

    const summaries = screen.getAllByText((_, node) => node?.textContent?.includes('Showing 11'));
    expect(summaries.length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(3);

    const perPageSelect = screen.getByLabelText(/Per page/i);
    await userEvent.selectOptions(perPageSelect, '20');
    expect(onItemsPerPageChange).toHaveBeenCalledWith(20);

    const pageThree = screen.getByRole('button', { name: 'Page 3' });
    await userEvent.click(pageThree);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});

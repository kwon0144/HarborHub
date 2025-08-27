'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  TextField,
  Box,
  Chip,
  Button,
  IconButton,
  Tooltip,
  FormControlLabel,
  Checkbox,
  Select,
  FormControl,
  InputLabel,
  Typography,
  Toolbar,
  InputAdornment,
  Menu,
  MenuItem,
  Collapse,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export default function MUIDataTable({
  data = [],
  columns = [],
  title = "Data Table",
  searchable = true,
  sortable = true,
  filterable = true,
  pagination = false,
  rowsPerPageOptions = [5, 10, 25, 50],
  defaultRowsPerPage = 10,
  dense = false,
  onRowClick = null,
  loading = false,
  emptyMessage = "No data available",
  customFilters = [],
  renderMobileCard = null,
  stickyHeader = false,
  maxHeight = null
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});
  const [expandedRows, setExpandedRows] = useState(new Set());

  const filteredData = useMemo(() => {
    let filtered = data;

    if (search && searchable) {
      filtered = filtered.filter((row) =>
        columns.some((column) => {
          const value = row[column.id];
          if (value == null) return false;
          return value.toString().toLowerCase().includes(search.toLowerCase());
        })
      );
    }

    Object.entries(activeFilters).forEach(([filterId, filterValue]) => {
      if (filterValue !== undefined && filterValue !== '' && filterValue !== null) {
        const filter = customFilters.find(f => f.id === filterId);
        if (filter && filter.filterFunction) {
          filtered = filter.filterFunction(filtered, filterValue);
        }
      }
    });

    return filtered;
  }, [data, search, activeFilters, columns, customFilters, searchable]);

  const sortedData = useMemo(() => {
    if (!sortable || !orderBy) return filteredData;
    return stableSort(filteredData, getComparator(order, orderBy));
  }, [filteredData, order, orderBy, sortable]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    return sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedData, page, rowsPerPage, pagination]);

  const visibleColumns = useMemo(() => 
    columns.filter(col => col.hidden !== true)
  , [columns]);

  const handleRequestSort = (property) => {
    if (!sortable) return;
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (filterId, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
    setPage(0);
  };

  const clearFilters = () => {
    setSearch('');
    setActiveFilters({});
    setPage(0);
  };

  const toggleRowExpansion = (rowId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  const renderCellContent = (row, column) => {
    if (column.render) {
      return column.render(row[column.id], row);
    }
    
    const value = row[column.id];
    
    if (column.type === 'chip') {
      return (
        <Chip 
          label={value}
          size="small"
          color={column.chipColor ? column.chipColor(value) : 'default'}
          variant={column.chipVariant || 'filled'}
        />
      );
    }
    
    if (column.type === 'boolean') {
      return value ? '✓' : '✗';
    }
    
    return value;
  };

  const renderMobileView = () => (
    <Box sx={{ p: 2 }}>
      {paginatedData.map((row, index) => {
        // Create a unique key by combining multiple identifiers
        const uniqueKey = `${row.id || 'no-id'}_${row.code || 'no-code'}_${page}_${index}`;
        const rowId = row.id || row.code || index;
        const isExpanded = expandedRows.has(rowId);
        
        if (renderMobileCard) {
          return renderMobileCard(row, index);
        }
        
        return (
          <Card 
            key={uniqueKey} 
            sx={{ 
              mb: 2,
              cursor: onRowClick ? 'pointer' : 'default',
              '&:hover': onRowClick ? {
                backgroundColor: theme.palette.action.hover,
                transition: 'background-color 0.2s ease'
              } : {}
            }}
            onClick={() => onRowClick && onRowClick(row)}
          >
            <CardContent>
              <Grid container spacing={2}>
                {/* Show first few important columns */}
                {visibleColumns.slice(0, 3).map((column) => (
                  <Grid size={4} key={column.id}>
                    <Typography variant="caption" color="textSecondary">
                      {column.label}
                    </Typography>
                    <Box sx={{ typography: 'body2' }}>
                      {renderCellContent(row, column)}
                    </Box>
                  </Grid>
                ))}
              </Grid>
              
              {visibleColumns.length > 3 && (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRowExpansion(rowId);
                    }}
                    endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{ mt: 2, width: '100%' }}
                  >
                    {isExpanded ? 'Show Less' : 'Show More'}
                  </Button>
                  
                  <Collapse in={isExpanded}>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      {visibleColumns.slice(3).map((column) => (
                        <Grid size={6} key={column.id}>
                          <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'medium' }}>
                            {column.label}
                          </Typography>
                          <Box sx={{ typography: 'body2', mt: 0.5 }}>
                            {renderCellContent(row, column)}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Collapse>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );

  if (loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Toolbar */}
      <Toolbar sx={{ pl: 2, pr: 1 }}>
        <Typography variant="h6" component="div" sx={{ flex: '1 1 100%' }}>
          {title}
        </Typography>
        
        {/* Search */}
        {searchable && (
          <TextField
            size="small"
            placeholder="Search..."
            value={search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mr: 1, minWidth: 200 }}
          />
        )}

        {/* Clear Filters */}
        {(search || Object.keys(activeFilters).length > 0) && (
          <Button
            size="small"
            onClick={clearFilters}
            sx={{ mr: 1 }}
          >
            Clear Filters
          </Button>
        )}

        {/* Custom Filters */}
        {filterable && customFilters.length > 0 && (
          <Tooltip title="Filters">
            <IconButton onClick={(e) => setFilterMenuAnchor(e.currentTarget)}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
        )}




      </Toolbar>

      {/* Custom Filters Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
        PaperProps={{
          sx: { minWidth: 250, maxWidth: 300 }
        }}
      >
        {customFilters.map((filter) => (
          <MenuItem key={filter.id} sx={{ p: 2, flexDirection: 'column', alignItems: 'stretch' }}>
            {filter.type === 'checkbox' ? (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={activeFilters[filter.id] || false}
                    onChange={(e) => handleFilterChange(filter.id, e.target.checked)}
                  />
                }
                label={filter.label}
              />
            ) : filter.type === 'select' ? (
              <FormControl size="small" fullWidth>
                <InputLabel>{filter.label}</InputLabel>
                <Select
                  value={activeFilters[filter.id] || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  label={filter.label}
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  {filter.options?.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                size="small"
                label={filter.label}
                value={activeFilters[filter.id] || ''}
                onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                fullWidth
              />
            )}
          </MenuItem>
        ))}
      </Menu>



      {/* Table or Mobile View */}
      {isMobile ? renderMobileView() : (
        <TableContainer sx={{ maxHeight: maxHeight }}>
          <Table 
            stickyHeader={stickyHeader}
            size={dense ? 'small' : 'medium'}
            aria-labelledby="tableTitle"
          >
            <TableHead>
              <TableRow>
                {visibleColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                    sortDirection={orderBy === column.id ? order : false}
                    sx={{ fontWeight: 'bold' }}
                  >
                    {sortable && column.sortable !== false ? (
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : 'asc'}
                        onClick={() => handleRequestSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length} align="center">
                    <Typography variant="body2" color="textSecondary">
                      {emptyMessage}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, index) => {
                  // Create a unique key by combining multiple identifiers
                  const uniqueKey = `${row.id || 'no-id'}_${row.code || 'no-code'}_${page}_${index}`;
                  
                  return (
                    <TableRow
                      key={uniqueKey}
                      onClick={() => onRowClick && onRowClick(row)}
                      sx={{ 
                        cursor: onRowClick ? 'pointer' : 'default',
                        '&:hover': onRowClick ? {
                          backgroundColor: theme.palette.action.hover,
                          transition: 'background-color 0.2s ease'
                        } : {}
                      }}
                    >
                      {visibleColumns.map((column) => (
                        <TableCell
                          key={column.id}
                          align={column.align || 'left'}
                        >
                          {renderCellContent(row, column)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {pagination && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Showing {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredData.length)} of {filteredData.length} items
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              size="small"
              select
              label="Rows"
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              sx={{ minWidth: 80 }}
            >
              {rowsPerPageOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <Button
              disabled={page === 0}
              onClick={(e) => handleChangePage(e, page - 1)}
            >
              Previous
            </Button>
            <Button
              disabled={page >= Math.ceil(filteredData.length / rowsPerPage) - 1}
              onClick={(e) => handleChangePage(e, page + 1)}
            >
              Next
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
}

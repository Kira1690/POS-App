#!/usr/bin/env bash
# =============================================================================
# Menu Seed Script — Direct SQLite injection via adb
# Adds 4 categories, 6 modifier groups, 10 menu items with modifier assignments
# Safe to run multiple times (clears and re-inserts each time)
# Usage: bash scripts/seed-menu.sh
# =============================================================================

set -e

PKG="com.ajinkya123.POSReactNativeApp"
DB="files/SQLite/pos_app.db"
NOW="2026-02-27T10:00:00.000Z"

run_sql() {
  adb shell "run-as $PKG sqlite3 $DB \"$1\""
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  POS Menu Seeder"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# --- Verify device connected ---
if ! adb devices | grep -q "device$"; then
  echo "ERROR: No Android device/emulator connected via adb."
  exit 1
fi

# --- Verify DB accessible ---
if ! adb shell "run-as $PKG ls $DB" &>/dev/null; then
  echo "ERROR: Cannot access $DB. Is the app installed and the DB created?"
  echo "  Launch the app once to create the DB, then run this script."
  exit 1
fi

echo ""
echo "▶ Step 1/5 — Clearing existing menu data..."
run_sql "DELETE FROM menu_item_modifier_assignments;"
run_sql "DELETE FROM modifier_options;"
run_sql "DELETE FROM modifier_groups;"
run_sql "DELETE FROM menu_items;"
run_sql "DELETE FROM menu_categories;"
echo "  ✓ Cleared"

# =============================================================================
echo ""
echo "▶ Step 2/5 — Inserting categories..."
# =============================================================================

run_sql "INSERT INTO menu_categories (id, restaurant_id, name, description, sort_order, is_active, color, icon, item_count, available_count, created_at, updated_at) VALUES
  ('cat_bev',  'rest_001', 'Beverages',       'Hot and cold drinks',            1, 1, '#2196F3', 'coffee',      0, 0, '$NOW', '$NOW'),
  ('cat_burg', 'rest_001', 'Burgers & Wraps', 'Handcrafted burgers and wraps',  2, 1, '#FF5722', 'hamburger',   0, 0, '$NOW', '$NOW'),
  ('cat_main', 'rest_001', 'Main Course',     'Hearty mains and rice dishes',   3, 1, '#4CAF50', 'food-fork-drink', 0, 0, '$NOW', '$NOW'),
  ('cat_des',  'rest_001', 'Desserts',        'Sweet treats and desserts',      4, 1, '#E91E63', 'cake-variant',0, 0, '$NOW', '$NOW');"

echo "  ✓ 4 categories"

# =============================================================================
echo ""
echo "▶ Step 3/5 — Inserting modifier groups..."
# =============================================================================

# Modifier groups
run_sql "INSERT INTO modifier_groups (id, restaurant_id, name, selection_type, is_required, min_selections, max_selections, is_active, sort_order, options, created_at, updated_at) VALUES
  ('mg_size',  'rest_001', 'Drink Size',   'single',   1, 1, 1, 1, 1, '[]', '$NOW', '$NOW'),
  ('mg_milk',  'rest_001', 'Milk Choice',  'single',   0, 0, 1, 1, 2, '[]', '$NOW', '$NOW'),
  ('mg_extras','rest_001', 'Add-ons',      'multiple', 0, 0, 4, 1, 3, '[]', '$NOW', '$NOW'),
  ('mg_sauce', 'rest_001', 'Sauce',        'single',   0, 0, 1, 1, 4, '[]', '$NOW', '$NOW'),
  ('mg_spice', 'rest_001', 'Spice Level',  'single',   1, 1, 1, 1, 5, '[]', '$NOW', '$NOW'),
  ('mg_sides', 'rest_001', 'Side Dish',    'single',   1, 1, 1, 1, 6, '[]', '$NOW', '$NOW');"

# Modifier options — Drink Size
run_sql "INSERT INTO modifier_options (id, modifier_group_id, name, price_adjustment, is_default, is_available, sort_order, created_at, updated_at) VALUES
  ('mo_size_s', 'mg_size', 'Small',  0.00, 1, 1, 1, '$NOW', '$NOW'),
  ('mo_size_m', 'mg_size', 'Medium', 0.50, 0, 1, 2, '$NOW', '$NOW'),
  ('mo_size_l', 'mg_size', 'Large',  1.00, 0, 1, 3, '$NOW', '$NOW');"

# Modifier options — Milk Choice
run_sql "INSERT INTO modifier_options (id, modifier_group_id, name, price_adjustment, is_default, is_available, sort_order, created_at, updated_at) VALUES
  ('mo_milk_reg',    'mg_milk', 'Regular Milk', 0.00, 1, 1, 1, '$NOW', '$NOW'),
  ('mo_milk_oat',    'mg_milk', 'Oat Milk',     0.75, 0, 1, 2, '$NOW', '$NOW'),
  ('mo_milk_almond', 'mg_milk', 'Almond Milk',  1.00, 0, 1, 3, '$NOW', '$NOW'),
  ('mo_milk_soy',    'mg_milk', 'Soy Milk',     0.75, 0, 1, 4, '$NOW', '$NOW');"

# Modifier options — Add-ons
run_sql "INSERT INTO modifier_options (id, modifier_group_id, name, price_adjustment, is_default, is_available, sort_order, created_at, updated_at) VALUES
  ('mo_ext_cheese',  'mg_extras', 'Cheddar Cheese', 1.00, 0, 1, 1, '$NOW', '$NOW'),
  ('mo_ext_bacon',   'mg_extras', 'Crispy Bacon',   2.00, 0, 1, 2, '$NOW', '$NOW'),
  ('mo_ext_avocado', 'mg_extras', 'Avocado',        2.00, 0, 1, 3, '$NOW', '$NOW'),
  ('mo_ext_egg',     'mg_extras', 'Fried Egg',      1.50, 0, 1, 4, '$NOW', '$NOW');"

# Modifier options — Sauce
run_sql "INSERT INTO modifier_options (id, modifier_group_id, name, price_adjustment, is_default, is_available, sort_order, created_at, updated_at) VALUES
  ('mo_sauce_mayo',    'mg_sauce', 'Mayonnaise', 0.00, 1, 1, 1, '$NOW', '$NOW'),
  ('mo_sauce_mustard', 'mg_sauce', 'Mustard',    0.00, 0, 1, 2, '$NOW', '$NOW'),
  ('mo_sauce_ketchup', 'mg_sauce', 'Ketchup',    0.00, 0, 1, 3, '$NOW', '$NOW'),
  ('mo_sauce_bbq',     'mg_sauce', 'BBQ Sauce',  0.50, 0, 1, 4, '$NOW', '$NOW'),
  ('mo_sauce_hot',     'mg_sauce', 'Sriracha',   0.50, 0, 1, 5, '$NOW', '$NOW');"

# Modifier options — Spice Level
run_sql "INSERT INTO modifier_options (id, modifier_group_id, name, price_adjustment, is_default, is_available, sort_order, created_at, updated_at) VALUES
  ('mo_spice_mild',  'mg_spice', 'Mild',       0.00, 1, 1, 1, '$NOW', '$NOW'),
  ('mo_spice_med',   'mg_spice', 'Medium',     0.00, 0, 1, 2, '$NOW', '$NOW'),
  ('mo_spice_hot',   'mg_spice', 'Hot',        0.00, 0, 1, 3, '$NOW', '$NOW'),
  ('mo_spice_xhot',  'mg_spice', 'Extra Hot',  0.00, 0, 1, 4, '$NOW', '$NOW');"

# Modifier options — Side Dish
run_sql "INSERT INTO modifier_options (id, modifier_group_id, name, price_adjustment, is_default, is_available, sort_order, created_at, updated_at) VALUES
  ('mo_side_fries',  'mg_sides', 'French Fries',  0.00, 1, 1, 1, '$NOW', '$NOW'),
  ('mo_side_salad',  'mg_sides', 'Garden Salad',  0.00, 0, 1, 2, '$NOW', '$NOW'),
  ('mo_side_rice',   'mg_sides', 'Steamed Rice',  0.00, 0, 1, 3, '$NOW', '$NOW'),
  ('mo_side_slaw',   'mg_sides', 'Coleslaw',      0.00, 0, 1, 4, '$NOW', '$NOW');"

echo "  ✓ 6 modifier groups, 22 options"

# =============================================================================
echo ""
echo "▶ Step 4/5 — Inserting 10 menu items..."
# =============================================================================

# --- BEVERAGES ---
run_sql "INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, is_available, preparation_time_minutes, sort_order, tax_rate, calories, created_at, updated_at) VALUES
  ('item_espresso',    'rest_001', 'cat_bev',  'Espresso',          'Rich single-origin espresso shot, smooth and bold', 3.50, 1, 3, 1, 0.0, 5,   '$NOW', '$NOW'),
  ('item_latte',       'rest_001', 'cat_bev',  'Latte',             'Espresso with steamed milk, silky smooth texture',  4.50, 1, 4, 2, 0.0, 120, '$NOW', '$NOW'),
  ('item_coldbrew',    'rest_001', 'cat_bev',  'Cold Brew',         '18-hour cold-steeped coffee, refreshingly smooth',  5.00, 1, 2, 3, 0.0, 10,  '$NOW', '$NOW'),
  ('item_chailatte',   'rest_001', 'cat_bev',  'Chai Tea Latte',    'Spiced masala tea with steamed milk',               4.00, 1, 4, 4, 0.0, 150, '$NOW', '$NOW');"

# --- BURGERS & WRAPS ---
run_sql "INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, is_available, preparation_time_minutes, sort_order, tax_rate, calories, created_at, updated_at) VALUES
  ('item_classicburg', 'rest_001', 'cat_burg', 'Classic Beef Burger',  'Juicy beef patty, lettuce, tomato, pickles in a brioche bun', 12.50, 1, 12, 1, 0.0, 650, '$NOW', '$NOW'),
  ('item_chickburg',   'rest_001', 'cat_burg', 'Crispy Chicken Burger','Buttermilk-fried chicken, slaw, pickles, house sauce',         11.50, 1, 10, 2, 0.0, 580, '$NOW', '$NOW');"

# --- MAIN COURSE ---
run_sql "INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, is_available, preparation_time_minutes, sort_order, tax_rate, calories, created_at, updated_at) VALUES
  ('item_salmon',     'rest_001', 'cat_main', 'Grilled Atlantic Salmon', 'Pan-seared salmon fillet with lemon butter sauce',    22.00, 1, 18, 1, 0.0, 420, '$NOW', '$NOW'),
  ('item_pasta',      'rest_001', 'cat_main', 'Pasta Carbonara',         'Spaghetti with pancetta, egg, parmesan and black pepper', 15.00, 1, 14, 2, 0.0, 720, '$NOW', '$NOW'),
  ('item_chickencurry','rest_001','cat_main', 'Chicken Curry Bowl',      'Slow-cooked curry with aromatic spices, served with naan',14.00, 1, 16, 3, 0.0, 540, '$NOW', '$NOW');"

# --- DESSERTS ---
run_sql "INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, is_available, preparation_time_minutes, sort_order, tax_rate, calories, created_at, updated_at) VALUES
  ('item_brownie',    'rest_001', 'cat_des', 'Chocolate Brownie Sundae', 'Warm fudge brownie topped with vanilla ice cream',     8.50, 1, 5, 1, 0.0, 490, '$NOW', '$NOW');"

echo "  ✓ 10 items (4 Beverages, 2 Burgers, 3 Mains, 1 Dessert)"

# =============================================================================
echo ""
echo "▶ Step 5/5 — Assigning modifiers to items..."
# =============================================================================

# Espresso → Size
run_sql "INSERT INTO menu_item_modifier_assignments (id, menu_item_id, modifier_group_id, sort_order, created_at) VALUES ('asgn_esp_sz',  'item_espresso',    'mg_size',   1, '$NOW');"

# Latte → Size, Milk, Extras (extra shot = cheese slot reuse)
run_sql "INSERT INTO menu_item_modifier_assignments (id, menu_item_id, modifier_group_id, sort_order, created_at) VALUES
  ('asgn_lat_sz',  'item_latte',  'mg_size',  1, '$NOW'),
  ('asgn_lat_mk',  'item_latte',  'mg_milk',  2, '$NOW');"

# Cold Brew → Size
run_sql "INSERT INTO menu_item_modifier_assignments (id, menu_item_id, modifier_group_id, sort_order, created_at) VALUES ('asgn_cb_sz',   'item_coldbrew',    'mg_size',   1, '$NOW');"

# Chai Latte → Size, Milk
run_sql "INSERT INTO menu_item_modifier_assignments (id, menu_item_id, modifier_group_id, sort_order, created_at) VALUES
  ('asgn_chai_sz', 'item_chailatte', 'mg_size',  1, '$NOW'),
  ('asgn_chai_mk', 'item_chailatte', 'mg_milk',  2, '$NOW');"

# Classic Burger → Add-ons, Sauce
run_sql "INSERT INTO menu_item_modifier_assignments (id, menu_item_id, modifier_group_id, sort_order, created_at) VALUES
  ('asgn_clb_ex',  'item_classicburg', 'mg_extras', 1, '$NOW'),
  ('asgn_clb_sc',  'item_classicburg', 'mg_sauce',  2, '$NOW');"

# Crispy Chicken Burger → Spice, Add-ons, Sauce
run_sql "INSERT INTO menu_item_modifier_assignments (id, menu_item_id, modifier_group_id, sort_order, created_at) VALUES
  ('asgn_ckb_sp',  'item_chickburg', 'mg_spice',  1, '$NOW'),
  ('asgn_ckb_ex',  'item_chickburg', 'mg_extras', 2, '$NOW'),
  ('asgn_ckb_sc',  'item_chickburg', 'mg_sauce',  3, '$NOW');"

# Grilled Salmon → Sides, Sauce
run_sql "INSERT INTO menu_item_modifier_assignments (id, menu_item_id, modifier_group_id, sort_order, created_at) VALUES
  ('asgn_sal_si',  'item_salmon', 'mg_sides', 1, '$NOW'),
  ('asgn_sal_sc',  'item_salmon', 'mg_sauce', 2, '$NOW');"

# Pasta Carbonara → Add-ons (extra protein)
run_sql "INSERT INTO menu_item_modifier_assignments (id, menu_item_id, modifier_group_id, sort_order, created_at) VALUES ('asgn_pas_ex',  'item_pasta',       'mg_extras', 1, '$NOW');"

# Chicken Curry → Spice, Sides
run_sql "INSERT INTO menu_item_modifier_assignments (id, menu_item_id, modifier_group_id, sort_order, created_at) VALUES
  ('asgn_cc_sp',   'item_chickencurry', 'mg_spice', 1, '$NOW'),
  ('asgn_cc_si',   'item_chickencurry', 'mg_sides', 2, '$NOW');"

# Brownie Sundae → Add-ons (toppings)
run_sql "INSERT INTO menu_item_modifier_assignments (id, menu_item_id, modifier_group_id, sort_order, created_at) VALUES ('asgn_brw_ex',  'item_brownie',     'mg_extras', 1, '$NOW');"

echo "  ✓ 17 modifier assignments"

# =============================================================================
echo ""
echo "▶ Verifying..."
# =============================================================================

CATS=$(run_sql "SELECT COUNT(*) FROM menu_categories;" | tr -d ' \r')
ITEMS=$(run_sql "SELECT COUNT(*) FROM menu_items;" | tr -d ' \r')
MGROUPS=$(run_sql "SELECT COUNT(*) FROM modifier_groups;" | tr -d ' \r')
MOPTIONS=$(run_sql "SELECT COUNT(*) FROM modifier_options;" | tr -d ' \r')
ASSIGNS=$(run_sql "SELECT COUNT(*) FROM menu_item_modifier_assignments;" | tr -d ' \r')

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Menu seed complete!"
echo ""
echo "  Categories     : $CATS"
echo "  Menu Items     : $ITEMS"
echo "  Modifier Groups: $MGROUPS"
echo "  Modifier Options: $MOPTIONS"
echo "  Assignments    : $ASSIGNS"
echo ""
echo "  ⚠  Reload the app (R R in Metro or press the reload button)"
echo "     for changes to take effect in the UI."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

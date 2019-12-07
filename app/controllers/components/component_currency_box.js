var args = arguments[0] || {};

$.name.text = args.name;

if (args.currentCurrency === args.name) $.checked.visible = true;

function setCurrency() {
  args.callback(args.name);
}

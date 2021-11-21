interface Handlers {
  vim: (checked: boolean) => void;
  inline: (checked: boolean) => void;
}

export function registerOptionsInputs({
  vim: handleVimChange,
  inline: handleInlineChange,
}: Handlers) {
  const byId = (id: string) => document.getElementById(id) as HTMLInputElement;
  const { vim: defaultVim, inline: defaultInline } = getDefaultOptions();

  const checkboxVim = byId("checkboxVim");
  checkboxVim.checked = defaultVim;
  handleVimChange(checkboxVim.checked);

  checkboxVim.addEventListener("change", (e) => {
    const { checked } = e.target as HTMLInputElement;
    handleVimChange(checked);
    if (checked) {
      // just needs to be truthy
      localStorage.setItem(storageVimOption, "1");
    } else {
      localStorage.removeItem(storageVimOption);
    }
  });

  const checkboxInline = byId("checkboxInline");
  checkboxInline.checked = defaultInline;
  handleInlineChange(checkboxInline.checked);

  checkboxInline.addEventListener("change", (e) => {
    const { checked } = e.target as HTMLInputElement;
    handleInlineChange(checked);
    if (checked) {
      // just needs to be truthy
      localStorage.setItem(storageInlineOption, "1");
    } else {
      localStorage.removeItem(storageInlineOption);
    }
  });
}

const storageVimOption = "vimBindings";
const storageInlineOption = "inlineMode";

function getDefaultOptions() {
  return {
    vim: !!localStorage.getItem(storageVimOption),
    inline: !!localStorage.getItem(storageInlineOption),
  };
}

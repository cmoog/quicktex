interface Handlers {
  vim: (checked: boolean) => void;
  inline: (checked: boolean) => void;
}

export function registerOptionsInputs({ vim, inline }: Handlers) {
  const checkboxVim = document.getElementById(
    "checkboxVim"
  ) as HTMLInputElement;
  vim(checkboxVim.checked);
  checkboxVim.addEventListener("change", (e) => {
    vim((e.target as HTMLInputElement).checked);
  });

  const checkboxInline = document.getElementById(
    "checkboxInline"
  ) as HTMLInputElement;
  inline(checkboxInline.checked);
  checkboxInline.addEventListener("change", (e) => {
    inline((e.target as HTMLInputElement).checked);
  });
}

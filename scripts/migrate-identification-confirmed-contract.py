from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f'{label} anchor missing; refusing migration')
    return text.replace(old, new, 1)

# Product: expose a translation-independent confirmed-state contract only after explicit confirmation.
identify_path = Path('src/pages/Identify.tsx')
identify = identify_path.read_text()
identify = replace_once(
    identify,
    "        {stage === 'identified' && selectedFish && (\n          <section className=\"overflow-hidden rounded-[26px] border border-emerald-100 bg-white p-4 shadow-sm md:p-6\">",
    "        {stage === 'identified' && selectedFish && (\n          <section data-identify-confirmed={selectedFish.id} className=\"overflow-hidden rounded-[26px] border border-emerald-100 bg-white p-4 shadow-sm md:p-6\">",
    'identified-state marker',
)
identify_path.write_text(identify)

# Browser proof: test semantic state instead of a fragile translated literal.
verify_path = Path('scripts/verify-result-ux-identification.mjs')
verify = verify_path.read_text()
verify = replace_once(
    verify,
    "  assert.equal(await page.getByText('物种已确认', { exact: true }).count(), 0, 'no candidate may be presented as confirmed before the user chooses it');",
    "  assert.equal(await page.locator('[data-identify-confirmed]').count(), 0, 'no candidate may be presented as confirmed before the user chooses it');",
    'pre-confirm semantic assertion',
)
verify = replace_once(
    verify,
    "  await confirmButtons.first().click();\n  await page.getByText('物种已确认', { exact: true }).waitFor();\n  await page.getByRole('heading', { name: '极火虾' }).waitFor();",
    "  await confirmButtons.first().click();\n  const confirmedState = page.locator('[data-identify-confirmed=\"sp_0001\"]');\n  await confirmedState.waitFor();\n  await confirmedState.getByRole('heading', { name: '极火虾' }).waitFor();",
    'post-confirm semantic assertion',
)
verify_path.write_text(verify)

# Permanent static contract: the explicit confirmation stage must expose the stable species-bound marker.
contract_path = Path('scripts/test-result-ux-contract.mjs')
contract = contract_path.read_text()
contract = replace_once(
    contract,
    "assert(identify.includes(\"setStage('identified')\"), 'Only the explicit confirmation path may move the flow into identified state');\nassert(identify.includes('onClick={startHealthTriage}'), 'Health triage must remain a separate explicit user action after identification');",
    "assert(identify.includes(\"setStage('identified')\"), 'Only the explicit confirmation path may move the flow into identified state');\nassert(identify.includes('data-identify-confirmed={selectedFish.id}'), 'Confirmed Identification state must expose a stable species-bound selector only after explicit confirmation');\nassert(identify.includes('onClick={startHealthTriage}'), 'Health triage must remain a separate explicit user action after identification');",
    'permanent confirmed-state contract',
)
contract_path.write_text(contract)

print('Identification confirmed-state contract migration prepared')

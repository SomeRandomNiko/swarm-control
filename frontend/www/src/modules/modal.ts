import {Cart} from "../types";
import {ebsFetch} from "../ebs";
import {getConfigVersion, getRedeems} from "./redeems";

const $modal = document.getElementById("modal-confirm")!;
const $modalTitle = document.getElementById("modal-title")!;
const $modalDescription = document.getElementById("modal-description")!;
const $modalImage = document.getElementById("modal-image")! as HTMLImageElement;
const $modalPrice = document.getElementById("modal-bits")!;
const $modalYes = document.getElementById("modal-yes")!;
const $modalNo = document.getElementById("modal-no")!;

export let cart: Cart | undefined;

document.addEventListener("DOMContentLoaded", () => {
    $modalYes.onclick = confirmPurchase;
    $modalNo.onclick = closeModal;
});

export function openModal(id: string, title: string, description: string, image: string, price: number, sku: string) {
    $modal.style.display = "flex";
    $modalTitle.textContent = title;
    $modalDescription.textContent = description;
    $modalPrice.textContent = price.toString();
    $modalImage.src = image;
    cart = {sku, id, args: {}};
}

function closeModal() {
    $modal.style.display = "none";
    cart = undefined;
}

async function confirmPurchase() {
    if (!await confirmVersion()) {
        const element = document.createElement('div');
        element.innerHTML = `CANNOT MAKE TRANSACTION: CONFIG VERSION MISMATCH!`;
        element.style.color = "gold";
        document.body.appendChild(element);
        // TODO: show some kind of error, and then refresh the buttons
        $modal.style.display = "none";
        return;
    }
    // TODO: Update cart args
    Twitch.ext.bits.useBits(cart!.sku)
}

async function confirmVersion() {
    const response = await ebsFetch("/public/confirm_transaction", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            version: await getConfigVersion()
        } satisfies {version: number}),
    });

    return response.ok;
}

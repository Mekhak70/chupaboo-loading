import { getProducts, saveProducts } from '../../admin/lib/db';
import { NextResponse } from 'next/server';

// GET - Ստանալ բոլոր ապրանքները
export async function GET() {
    try {
        const products = getProducts();
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json(
            { error: 'Տվյալները չհաջողվեց բեռնել' },
            { status: 500 }
        );
    }
}

// POST - Ավելացնել նոր ապրանք
export async function POST(request) {
    try {
        const newProduct = await request.json();
        const products = getProducts();

        // Ստուգել ID-ի կրկնությունը
        if (products.find(p => p.id === newProduct.id)) {
            return NextResponse.json(
                { error: 'Այս ID-ով ապրանք արդեն կա' },
                { status: 400 }
            );
        }

        // Ավելացնել նկարի դեֆոլթ արժեք
        if (!newProduct.image) {
            newProduct.image = 'img-placeholder';
        }

        products.push(newProduct);
        saveProducts(products);

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Տվյալները չհաջողվեց պահպանել' },
            { status: 500 }
        );
    }
}
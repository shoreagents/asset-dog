import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/assets/[id] - Fetch single asset
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const assetId = params.id

    const { data: asset, error } = await supabase
      .from("assets")
      .select("*")
      .eq("asset_tag_id", assetId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 })
      }
      console.error("Error fetching asset:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: asset 
    })
  } catch (error) {
    console.error("Error in GET /api/assets/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/assets/[id] - Update asset
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const assetId = params.id
    const body = await request.json()

    // Prepare update data
    const updateData = {
      name: body.name,
      description: body.description,
      category: body.category,
      sub_category: body.subCategory,
      location: body.location,
      site: body.site,
      status: body.status,
      cost: body.value,
      purchase_date: body.purchaseDate,
      date_acquired: body.dateAcquired,
      assigned_to: body.assignedTo,
      department: body.department,
      brand: body.brand,
      model: body.model,
      serial_number: body.serialNumber,
      manufacturer: body.manufacturer,
      notes: body.notes,
      image_url: body.imageUrl,
      image_file_name: body.imageFileName
    }

    // Remove undefined/null values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined || updateData[key as keyof typeof updateData] === null) {
        delete updateData[key as keyof typeof updateData]
      }
    })

    const { data: asset, error } = await supabase
      .from("assets")
      .update(updateData)
      .eq("asset_tag_id", assetId)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 })
      }
      console.error("Error updating asset:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: asset 
    })
  } catch (error) {
    console.error("Error in PUT /api/assets/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/assets/[id] - Delete asset
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const assetId = params.id

    const { data: asset, error } = await supabase
      .from("assets")
      .delete()
      .eq("asset_tag_id", assetId)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 })
      }
      console.error("Error deleting asset:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Asset deleted successfully",
      data: asset 
    })
  } catch (error) {
    console.error("Error in DELETE /api/assets/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
